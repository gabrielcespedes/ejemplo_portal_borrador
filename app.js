// 3 JAVASCRIPT
// ==========================================
// 1. CONFIGURACIÓN DE AUTH0
// ==========================================
// Aquí pegamos las llaves que nos dio Auth0 en el Dashboard
const auth0Config = {
    domain: "dev-q0nyeiaxgarzlzjm.us.auth0.com", // Ej: dev-xxxx.us.auth0.com
    clientId: "lHehndIz0gsplumtzwkGhj0OSUoXBFh7", // Ej: Abc123xyz...
    authorizationParams: {
        // Redirigimos al usuario a nuestro Live Server tras iniciar sesión
        redirect_uri: window.location.origin 
    }
};

// Variable global para almacenar el cliente de Auth0
let auth0Client = null;

// ==========================================
// 2. INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
// Esta función arranca apenas carga la página
window.onload = async () => {
    // Inicializamos el SDK de Auth0 que importamos en el HTML
    auth0Client = await auth0.createAuth0Client(auth0Config);

    // Revisamos si el usuario acaba de volver de la página de inicio de sesión de Auth0
    // Auth0 envía un código ("code" y "state") en la URL
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        // Procesamos el inicio de sesión y limpiamos la URL
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }

    // Actualizamos la interfaz gráfica (botones y mensajes)
    updateUI();
};

// ==========================================
// 3. LÓGICA DE INTERFAZ GRÁFICA (UI)
// ==========================================
async function updateUI() {
    // Le preguntamos a Auth0: "¿Este usuario está conectado?"
    const isAuthenticated = await auth0Client.isAuthenticated();

    const btnLogin = document.getElementById("btn-login");
    const btnLogout = document.getElementById("btn-logout");
    const appContent = document.getElementById("app-content");
    const mensajeBienvenida = document.getElementById("mensaje-bienvenida");

    if (isAuthenticated) {
        // Si está conectado: Ocultamos Login, mostramos Logout y el contenido de la clínica
        btnLogin.style.display = "none";
        btnLogout.style.display = "inline-block";
        appContent.style.display = "block"; // ¡Aparece la clínica!

        // Obtenemos los datos del paciente desde Auth0
        const user = await auth0Client.getUser();
        mensajeBienvenida.innerText = `Bienvenido(a), paciente ${user.name}`;
    } else {
        // Si NO está conectado: Mostramos Login, ocultamos todo lo demás
        btnLogin.style.display = "inline-block";
        btnLogout.style.display = "none";
        appContent.style.display = "none";
        mensajeBienvenida.innerText = "";
    }
}

// ==========================================
// 4. EVENTOS DE LOS BOTONES
// ==========================================
// Botón Iniciar Sesión
document.getElementById("btn-login").addEventListener("click", async () => {
    // Redirige a la página segura de Auth0
    await auth0Client.loginWithRedirect();
});

// Botón Cerrar Sesión
document.getElementById("btn-logout").addEventListener("click", () => {
    // Cierra la sesión en Auth0 y devuelve al usuario a nuestra página
    auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin
        }
    });
});