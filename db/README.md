# Base de Datos para el Sistema de Gestión de Comisiones Académicas

Este directorio contiene los archivos necesarios para la creación y población inicial de la base de datos del sistema.

## Estructura del esquema

El esquema de base de datos está organizado en las siguientes secciones:

1. **Usuarios y autenticación**
   - `roles`: Define los roles de los usuarios (admin, docente)
   - `usuarios`: Información de los usuarios del sistema

2. **Estructura organizacional**
   - `departamentos`: Departamentos académicos de la institución
   - `programas_educativos`: Programas educativos asociados a departamentos

3. **Comisiones académicas**
   - `tipos_participacion`: Tipos de participación en comisiones (ponente, asistente, etc.)
   - `estados_solicitud`: Estados posibles de las solicitudes y reportes
   - `solicitudes_comision`: Solicitudes de comisión académica
   - `archivos_solicitud`: Archivos adjuntos a solicitudes

4. **Reportes académicos**
   - `tipos_reporte`: Tipos de reportes académicos
   - `reportes_academicos`: Reportes de actividades presentados por docentes
   - `evidencias_reporte`: Archivos de evidencia adjuntos a reportes

5. **Registro y configuración**
   - `log_actividad`: Registro de actividades del sistema para auditoría
   - `configuracion_sistema`: Parámetros de configuración del sistema
   - `notificaciones`: Sistema de notificaciones para usuarios

## Archivos incluidos

- `schema.sql`: Contiene la definición completa del esquema (tablas, relaciones, índices)
- `seed.sql`: Contiene datos iniciales para el funcionamiento básico del sistema

## Instrucciones de implementación

1. Crear la base de datos:
   ```sql
   CREATE DATABASE sgca_fcqi;
   USE sgca_fcqi;
   ```

2. Ejecutar el script de creación de esquema:
   ```
   mysql -u usuario -p sgca_fcqi < schema.sql
   ```

3. Ejecutar el script de datos iniciales:
   ```
   mysql -u usuario -p sgca_fcqi < seed.sql
   ```

## Relaciones principales

- Un usuario tiene un rol (docente o administrativo)
- Un docente puede crear múltiples solicitudes de comisión
- Una solicitud de comisión aprobada puede generar un reporte académico
- Los administradores revisan tanto solicitudes como reportes
- Cada solicitud y reporte tiene un estado (En revisión, Aprobada, Rechazada, Requiere correcciones)

## Notas de desarrollo

- Las contraseñas almacenadas en la base de datos deben estar hasheadas (bcrypt)
- Los archivos adjuntos se registran en la base de datos, pero se almacenan en el sistema de archivos
- Se utiliza un sistema de estados para el seguimiento del flujo de aprobaciones
