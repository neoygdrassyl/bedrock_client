# Manual Local Docker y Migracion a Otro Computador

Fecha: 2026-03-31

## 1. Decision recomendada

Si. Para tu caso, la topologia mas conveniente es esta:

- Instalar WSL2 en el computador nuevo.
- Instalar Docker Desktop y activar integracion con la distro WSL.
- Clonar frontend y backend dentro del filesystem Linux de WSL, no dentro de C:.
- Poner el Dockerfile en la raiz del backend.
- Poner el compose.yaml tambien en la raiz del backend.
- Levantar backend + MariaDB desde el backend con docker compose.
- Ejecutar el frontend por fuera de Docker con npm start o npm run dev.
- Conectar el frontend al backend con VITE_API_URL en el .env del frontend.

Esto te da una migracion mas simple, mejor performance para Node/Vite y menos friccion para editar desde VS Code.

## 2. Como queda la estructura

Ejemplo sugerido en el equipo nuevo:

```text
/home/TU_USUARIO/dovela/
  frontend/
  backend/
```

Importante:

- Guarda ambos repos dentro del filesystem Linux de WSL.
- Evita trabajar los repos dentro de /mnt/c/... si vas a usar bind mounts, watchers, Vite o nodemon.

## 3. Donde van los archivos Docker

En el backend:

- backend/Dockerfile
- backend/compose.yaml
- backend/.dockerignore
- backend/.env

El frontend no necesita Dockerfile en la primera fase.

## 4. Por que conviene esta topologia

### Frontend fuera de Docker

Ventajas:

- Vite y hot reload funcionan mas simple.
- Menos problemas de file watching en Windows/WSL.
- Menos complejidad cuando estas iterando UI.
- Mantienes el flujo actual del repo frontend casi intacto.

### Backend y base de datos dentro de Docker

Ventajas:

- Replicas mas facil el entorno dificil.
- La base de datos queda contenida y persistente con volumen.
- El backend puede depender de un hostname estable como db.
- Es mas facil mover el stack a otro equipo.

## 5. Sesiones y auth

Docker no cambia la logica de sesiones actual del frontend.

Hoy el frontend:

- consume el backend por VITE_API_URL
- adjunta Bearer token en las peticiones
- persiste token y usuario en localStorage

Por tanto, si mantienes:

- frontend en http://localhost:3000
- backend en http://localhost:3001

la sesion debe comportarse igual que ahora.

Lo importante es que el backend conserve su .env y que el frontend apunte a la URL correcta.

## 6. Llaves SSH en el equipo nuevo

Segun el estado actual observado:

- El frontend usa GitHub con una llave distinta, asociada al alias github.com-nueva.
- El backend usa acceso SSH directo al servidor remoto, no a GitHub.

Recomendacion:

1. Copiar tus llaves actuales al nuevo equipo solo si es un equipo personal y confiable.
2. Si prefieres una migracion mas limpia, genera una nueva llave para GitHub y registrala en tu cuenta.
3. Mantener otra llave para el acceso SSH del backend si ese acceso sigue siendo por servidor.

No mezcles la llave de GitHub con la del servidor si hoy ya las tienes separadas.

## 7. Archivos y datos que debes migrar

No basta con clonar repos. Tambien necesitas:

1. El .env del frontend.
2. El .env del backend.
3. El dump de la base de datos.
4. La carpeta docs del backend si contiene archivos operativos.
5. Tus llaves SSH.
6. Cualquier cambio local del backend que aun no este subido.

## 8. Pasos recomendados en el computador nuevo

### Paso 1. Instalar base del entorno

Instala:

- WSL2
- una distro Linux, por ejemplo Ubuntu
- Docker Desktop
- VS Code

Despues activa en Docker Desktop:

- Use the WSL 2 based engine
- Integracion con tu distro WSL

### Paso 2. Instalar herramientas dentro de WSL

Dentro de la distro:

```bash
sudo apt update
sudo apt install -y git openssh-client
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node -v
npm -v
docker --version
docker compose version
```

### Paso 3. Crear estructura local

```bash
mkdir -p ~/dovela
cd ~/dovela
git clone <REMOTE_FRONTEND> frontend
git clone <REMOTE_BACKEND_O_COPIA_LOCAL> backend
```

Nota:

- Si el backend no esta completamente subido al remoto, primero respalda o sincroniza tu working tree actual.

### Paso 4. Restaurar llaves SSH

Restaura tus llaves en ~/.ssh y valida permisos:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 600 ~/.ssh/nueva_llave
chmod 644 ~/.ssh/*.pub
```

Config minima sugerida:

```sshconfig
Host github.com-antigua
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa

Host github.com-nueva
    HostName github.com
    User git
    IdentityFile ~/.ssh/nueva_llave
```

### Paso 5. Restaurar .env

Frontend:

```env
VITE_API_URL="http://localhost:3001/api"
VITE_GLOBAL_ID="cb1"
```

Backend:

- conserva DB_HOST, DB_USER, DB_PASSWORD y DB_NAME
- ajusta DB_HOST=db cuando uses Docker Compose
- conserva JWT_SECRET, AUTH_ENABLED y credenciales de correo

### Paso 6. Restaurar base de datos

Desde el equipo viejo puedes exportar asi:

```bash
mysqldump -h HOST -u USER -p DB_NAME > dovela.sql
```

Y luego importar dentro del contenedor de base de datos.

### Paso 7. Restaurar docs del backend

Si tu backend guarda archivos operativos en docs, copialos al repo backend nuevo antes de levantar el stack o montalos desde backup.

## 9. Dockerfile recomendado para el backend

Ubicacion: backend/Dockerfile

```Dockerfile
FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start"]
```

Notas:

- En desarrollo, compose puede sobreescribir el comando a npm run dev.
- Si usas bind mount del repo, agrega un volumen separado para /app/node_modules.

## 10. compose.yaml recomendado para el backend

Ubicacion: backend/compose.yaml

```yaml
services:
  db:
    image: mariadb:10.4
    container_name: dovela-db
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: root_local_change_me
      MARIADB_DATABASE: dovela
      MARIADB_USER: dovela
      MARIADB_PASSWORD: dovela_local_change_me
    ports:
      - "3307:3306"
    volumes:
      - dovela_db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mariadb-admin ping -h 127.0.0.1 -u$$MARIADB_USER -p$$MARIADB_PASSWORD --silent"]
      interval: 10s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dovela-backend
    restart: unless-stopped
    working_dir: /app
    env_file:
      - .env
    command: sh -c "npm install && npm run dev"
    ports:
      - "3001:3001"
    volumes:
      - ./:/app
      - dovela_backend_node_modules:/app/node_modules
      - ./docs:/app/docs
    depends_on:
      db:
        condition: service_healthy

volumes:
  dovela_db_data:
  dovela_backend_node_modules:
```

## 11. .env del backend en Docker

Cuando corras con Compose, ajusta minimo esto:

```env
DB_HOST=db
DB_USER=dovela
DB_PASSWORD=dovela_local_change_me
DB_NAME=dovela

PORT=3001
IP_ADRESS=0.0.0.0

JWT_SECRET=CAMBIAR_ESTA_CLAVE
AUTH_ENABLED=true
```

Mantiene tambien las variables reales de correo si el flujo local las necesita.

## 12. .dockerignore sugerido

Ubicacion: backend/.dockerignore

```text
node_modules
npm-debug.log
.git
.gitignore
Dockerfile
compose.yaml
```

## 13. Como levantar el stack

Desde backend:

```bash
docker compose up -d --build
docker compose logs -f backend
docker compose logs -f db
```

Luego en otra terminal, desde frontend:

```bash
nvm use 22
npm install
npm run dev
```

## 14. Como importar la base de datos al contenedor

Si ya tienes un dump llamado dovela.sql:

```bash
docker compose exec -T db sh -c 'mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' < dovela.sql
```

## 15. Checklist de validacion

### Infra

- docker y docker compose funcionan dentro de WSL
- backend responde en localhost:3001
- frontend responde en localhost:3000
- frontend alcanza al backend por VITE_API_URL

### Auth

- login responde
- el token se guarda
- las peticiones autenticadas incluyen Bearer token
- el backend no responde 401 por mala configuracion de AUTH_ENABLED o JWT_SECRET

### Datos

- tablas presentes
- datos base cargados
- archivos de docs accesibles si el flujo los necesita

## 16. Riesgos a vigilar

1. El backend actual tiene muchos cambios locales. Si no los sincronizas, el nuevo equipo no sera equivalente.
2. El backend ejecuta sequelize.sync({ alter: true }) al arrancar. No hagas pruebas sobre una base sensible sin backup.
3. Si faltan archivos en docs, varios flujos pueden romperse aunque la app arranque.
4. Si Docker Desktop no tiene integracion WSL activa, docker no funcionara dentro de la distro.

## 17. Regla practica final

Primera fase recomendada:

- frontend fuera de Docker
- backend en Docker
- MariaDB en Docker

Segunda fase opcional, solo si realmente la necesitas:

- frontend tambien dentro de Compose

No intentes resolver toda la migracion en una sola jugada. Primero estabiliza backend + db, luego conectas frontend y validas auth, y solo despues piensas si vale la pena contenedizar el frontend.