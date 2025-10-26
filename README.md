# Sistema de Gerenciamento de Estacionamento

Sistema completo de gerenciamento de estacionamento desenvolvido com Angular 20, com interface responsiva e moderna.

## Funcionalidades

- **Autenticação de Usuários**: Sistema de login seguro com validação
- **Gestão de Veículos**: Registro de entrada com marca, modelo e placa
- **Controle de Tempo**: Monitoramento automático do tempo de permanência
- **Cálculo Automático**: Geração de valores baseado em R$ 5,00/hora
- **Retirada de Veículos**: Modal com detalhamento de valores a pagar
- **Interface Responsiva**: Adaptável para desktop, tablet e mobile
- **Persistência de Dados**: Armazenamento local dos dados

## Tecnologias Utilizadas

- Angular 20.3.7
- TypeScript
- SCSS
- RxJS
- LocalStorage para persistência

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.7.

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

## Como Usar

1. Inicie o servidor de desenvolvimento:
```bash
ng serve
```

2. Acesse http://localhost:4200

3. **Login**:
   - Digite qualquer usuário e uma senha com no mínimo 6 caracteres
   - Clique em "Entrar"

4. **Adicionar Veículo**:
   - Clique no botão "Adicionar Veículo"
   - Preencha: Marca, Modelo e Placa (formato: ABC-1234 ou ABC1D23)
   - Clique em "Adicionar"

5. **Retirar Veículo**:
   - Na lista de veículos, clique no botão "Retirada"
   - Visualize o tempo e valor calculado
   - Clique em "Confirmar Retirada"

## Regras de Negócio

- **Cobrança**: R$ 5,00 por hora ou fração de hora
- **Valor mínimo**: R$ 5,00
- **Validação de placa**: Formato brasileiro (ABC-1234 ou ABC1D23)
- **Senha mínima**: 6 caracteres

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
