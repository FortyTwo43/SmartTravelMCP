# SmartTravel

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.10.

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

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

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

## Entity Relationship Diagram

```mermaid
erDiagram

auth.users{
    string id PK
    string email
    string encrypted_password
}

perfil {
    string id PK
    string nombre
    string apellido
    string rol "'viajero' | 'proveedor' | 'admin'"
    date fecha_registro
    string estado "'activo' | 'inactivo'"
}

perfil_viajero {
    string id PK
    string intereses
    decimal presupuesto
    string idioma
    string tipo_viaje "'solo' | 'pareja' | 'familia' | 'amigos'"
}

solicitud_proveedor {
    string id PK
    string id_perfil FK
    string nombre_negocio
    string tipo_negocio "'restaurante' | 'hotel' | 'tour'"
    string descripcion
    string telefono
    string ubicacion
    string documento_url
    string estado "'pendiente' | 'aceptado' | 'rechazado'"
    date fecha_solicitud
}

destino {
    string id PK
    string nombre
    string ciudad
    string pais
    string descripcion
    string tipo_experiencia "'aventura' | 'cultura' | 'naturaleza' | 'playa'"
    string imagen
}

establecimiento_turistico {
    string id PK
    string id_proveedor FK
    string id_destino FK
    string nombre
    string tipo "'restaurante' | 'hotel' | 'tour'"
    string descripcion
    string estado "'activo' | 'inactivo'"
}

servicio_reservable {
    string id PK
    string id_establecimiento FK
    string nombre
    decimal precio
    string descripcion
    string comodidades_adicionales
    boolean disponibilidad
}

itinerario {
    string id PK
    string id_perfil FK
    string nombre
    date fecha_inicio
    date fecha_fin
    string estado "'interes' | 'activo' | 'completado' | 'pausado'"
}

detalle_itinerario {
    string id PK
    string id_itinerario FK
    string id_servicio_reservable FK
    date fecha
    string hora
    string prioridad "'alto' | 'medio' | 'bajo'"
    string estado "'pendiente' | 'en_progreso' | 'completado'"
}

reserva {
    string id PK
    string id_perfil FK
    string id_servicio_reservable FK
    date fecha_reserva
    int cantidad_personas
    decimal precio_total
    string estado "'pendiente' | 'aceptado' | 'rechazado'"
}

recomendacion {
    string id PK
    string id_perfil FK
    string id_destino FK
    string motivo
    date fecha_generada
}

notificacion {
    string id PK
    string id_perfil FK
    string mensaje
    date fecha_envio
    boolean leida
}


%% RELACIONES

auth.users ||--|| perfil : tiene

perfil ||--|| perfil_viajero : tiene

perfil ||--o{ solicitud_proveedor : solicita

perfil ||--o{ itinerario : crea

perfil ||--o{ reserva : realiza

perfil ||--o{ notificacion : recibe

perfil ||--o{ recomendacion : obtiene

destino ||--o{ establecimiento_turistico : contiene

perfil ||--o{ establecimiento_turistico : administra

establecimiento_turistico ||--o{ servicio_reservable : ofrece

itinerario ||--o{ detalle_itinerario : incluye

servicio_reservable ||--o{ detalle_itinerario : pertenece

servicio_reservable ||--o{ reserva : genera

establecimiento_turistico ||--o{ recomendacion : recomendado
```
