import { Vehicle } from '../models/Vehicle.js';

// Get all vehicles
export const getAllVehicles = async (req, res, next) => {
  try {
    const { status } = req.query;

    let vehicles;
    if (status) {
      vehicles = await Vehicle.findByStatus(status);
    } else {
      vehicles = await Vehicle.findAll();
    }

    res.json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    next(error);
  }
};

// Get parked vehicles (estacionados)
export const getEstacionados = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.getEstacionados();

    res.json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    next(error);
  }
};

// Get vehicle by ID
export const getVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        error: 'Veículo não encontrado',
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Add new vehicle
export const addVehicle = async (req, res, next) => {
  try {
    const { marca, modelo, placa } = req.body;
    const userId = req.user?.id;

    // Check if vehicle with this placa is already parked
    const existingVehicles = await Vehicle.findByPlaca(placa);
    const alreadyParked = existingVehicles.find(v => v.status === 'estacionado');

    if (alreadyParked) {
      return res.status(409).json({
        error: 'Veículo já estacionado',
        message: 'A vehicle with this license plate is already parked',
        vehicle: alreadyParked
      });
    }

    // Create new vehicle
    const vehicle = await Vehicle.create(marca, modelo, placa, userId);

    res.status(201).json({
      success: true,
      message: 'Veículo adicionado com sucesso',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Calculate parking fee
export const calcularValor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        error: 'Veículo não encontrado',
        message: 'Vehicle not found'
      });
    }

    if (vehicle.status === 'retirado') {
      return res.json({
        success: true,
        vehicle,
        valor_total: vehicle.valor_total
      });
    }

    const valorTotal = Vehicle.calcularValor(vehicle.data_entrada);

    res.json({
      success: true,
      vehicle,
      valor_total: valorTotal
    });
  } catch (error) {
    next(error);
  }
};

// Checkout vehicle
export const checkoutVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.checkout(id);

    res.json({
      success: true,
      message: 'Veículo retirado com sucesso',
      vehicle
    });
  } catch (error) {
    if (error.message === 'Veículo não encontrado') {
      return res.status(404).json({
        error: error.message,
        message: 'Vehicle not found'
      });
    }
    if (error.message === 'Veículo já foi retirado') {
      return res.status(400).json({
        error: error.message,
        message: 'Vehicle already checked out'
      });
    }
    next(error);
  }
};

// Update vehicle
export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { marca, modelo, placa } = req.body;

    const vehicle = await Vehicle.update(id, marca, modelo, placa);

    if (!vehicle) {
      return res.status(404).json({
        error: 'Veículo não encontrado',
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Veículo atualizado com sucesso',
      vehicle
    });
  } catch (error) {
    next(error);
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Vehicle.delete(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Veículo não encontrado',
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Veículo removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// Get statistics
export const getStats = async (req, res, next) => {
  try {
    const stats = await Vehicle.getStats();

    res.json({
      success: true,
      stats: {
        estacionados: parseInt(stats.estacionados),
        retirados: parseInt(stats.retirados),
        total: parseInt(stats.total),
        receita_total: parseFloat(stats.receita_total),
        ticket_medio: parseFloat(stats.ticket_medio)
      }
    });
  } catch (error) {
    next(error);
  }
};
