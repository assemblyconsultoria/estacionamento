import { query } from '../config/database.js';

export class Vehicle {
  // Valor por hora em reais
  static VALOR_POR_HORA = 5.00;
  static VALOR_MINIMO = 5.00;

  // Create a new vehicle
  static async create(marca, modelo, placa, userId = null) {
    const placaUpper = placa.toUpperCase();

    const result = await query(
      `INSERT INTO vehicles (marca, modelo, placa, data_entrada, status, user_id)
       VALUES ($1, $2, $3, NOW(), 'estacionado', $4)
       RETURNING *`,
      [marca, modelo, placaUpper, userId]
    );

    return result.rows[0];
  }

  // Find all vehicles
  static async findAll() {
    const result = await query(
      'SELECT * FROM vehicles ORDER BY data_entrada DESC'
    );

    return result.rows;
  }

  // Find vehicles by status
  static async findByStatus(status) {
    const result = await query(
      'SELECT * FROM vehicles WHERE status = $1 ORDER BY data_entrada DESC',
      [status]
    );

    return result.rows;
  }

  // Find vehicle by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM vehicles WHERE id = $1',
      [id]
    );

    return result.rows[0];
  }

  // Find vehicle by placa (license plate)
  static async findByPlaca(placa) {
    const result = await query(
      'SELECT * FROM vehicles WHERE placa = $1 ORDER BY data_entrada DESC',
      [placa.toUpperCase()]
    );

    return result.rows;
  }

  // Calculate parking fee
  static calcularValor(dataEntrada, dataSaida = new Date()) {
    const entrada = new Date(dataEntrada);
    const saida = new Date(dataSaida);

    // Calculate difference in milliseconds
    const diferencaMs = saida.getTime() - entrada.getTime();

    // Convert to hours
    const horas = diferencaMs / (1000 * 60 * 60);

    // Round up (charge for started hours)
    const horasCobranca = Math.ceil(horas);

    // Calculate total value
    const valor = horasCobranca * this.VALOR_POR_HORA;

    // Return minimum value if lower
    return Math.max(valor, this.VALOR_MINIMO);
  }

  // Checkout vehicle (process exit)
  static async checkout(id) {
    // Get vehicle
    const vehicle = await this.findById(id);

    if (!vehicle) {
      throw new Error('Veículo não encontrado');
    }

    if (vehicle.status === 'retirado') {
      throw new Error('Veículo já foi retirado');
    }

    // Calculate value
    const valorTotal = this.calcularValor(vehicle.data_entrada);

    // Update vehicle
    const result = await query(
      `UPDATE vehicles
       SET data_saida = NOW(),
           valor_total = $1,
           status = 'retirado'
       WHERE id = $2
       RETURNING *`,
      [valorTotal, id]
    );

    return result.rows[0];
  }

  // Update vehicle
  static async update(id, marca, modelo, placa) {
    const result = await query(
      `UPDATE vehicles
       SET marca = $1, modelo = $2, placa = $3
       WHERE id = $4
       RETURNING *`,
      [marca, modelo, placa.toUpperCase(), id]
    );

    return result.rows[0];
  }

  // Delete vehicle
  static async delete(id) {
    const result = await query(
      'DELETE FROM vehicles WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows[0];
  }

  // Get parked vehicles (active)
  static async getEstacionados() {
    return await this.findByStatus('estacionado');
  }

  // Get statistics
  static async getStats() {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'estacionado') as estacionados,
        COUNT(*) FILTER (WHERE status = 'retirado') as retirados,
        COUNT(*) as total,
        COALESCE(SUM(valor_total), 0) as receita_total,
        COALESCE(AVG(valor_total), 0) as ticket_medio
      FROM vehicles
    `);

    return result.rows[0];
  }
}
