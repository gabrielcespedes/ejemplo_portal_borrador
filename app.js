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

// ==========================================
// 5. BASE DE DATOS LOCAL (El Catálogo)
// ==========================================
// Cumplimos con el requisito: 3 categorías, con nombre, descripción, precio e imagen (usaremos emojis/iconos por simplicidad)
const examenesCatalogo = [
    { id: 1, categoria: "Laboratorio", nombre: "Perfil Lipídico", descripcion: "Requiere ayuno de 8 a 12 horas.", precio: 15000, icono: "🩸" },
    { id: 2, categoria: "Laboratorio", nombre: "Hemograma Completo", descripcion: "Análisis de sangre general. Sin ayuno.", precio: 8500, icono: "🧪" },
    { id: 3, categoria: "Imagenología", nombre: "Radiografía de Tórax", descripcion: "No requiere preparación previa.", precio: 22000, icono: "🩻" },
    { id: 4, categoria: "Imagenología", nombre: "Ecografía Abdominal", descripcion: "Requiere tomar 1 litro de agua antes.", precio: 35000, icono: "🖥️" },
    { id: 5, categoria: "Cardiología", nombre: "Electrocardiograma", descripcion: "Evaluación del ritmo cardíaco.", precio: 18000, icono: "❤️" }
];

// ==========================================
// 6. MANEJO DE ESTADO Y SESSION STORAGE
// ==========================================
// Intentamos recuperar la orden previa del Session Storage. 
// Si no hay nada, iniciamos un arreglo vacío.
// OJO: Session Storage guarda texto, por eso usamos JSON.parse y JSON.stringify
let ordenMedica = JSON.parse(sessionStorage.getItem("orden_clinica")) || [];

// ==========================================
// 7. RENDERIZADO (Pintar en pantalla)
// ==========================================
function renderizarCatalogo() {
    const contenedor = document.getElementById("lista-examenes");
    contenedor.innerHTML = ""; // Limpiamos antes de pintar

    examenesCatalogo.forEach(examen => {
        // Creamos una tarjeta (Card) para cada examen
        const tarjeta = document.createElement("div");
        tarjeta.className = "examen-card";
        tarjeta.innerHTML = `
            <div style="font-size: 3rem;">${examen.icono}</div>
            <h3>${examen.nombre}</h3>
            <span class="categoria">${examen.categoria}</span>
            <p>${examen.descripcion}</p>
            <p class="precio">Copago: $${examen.precio.toLocaleString('es-CL')}</p>
            <button onclick="agregarAOrden(${examen.id})">Agregar a la Orden</button>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function renderizarOrden() {
    const listaOrden = document.getElementById("lista-orden");
    const spanTotal = document.getElementById("total-copago");
    const btnAgendar = document.getElementById("btn-agendar");
    
    listaOrden.innerHTML = "";
    let total = 0;

    if (ordenMedica.length === 0) {
        listaOrden.innerHTML = "<li>No hay exámenes seleccionados.</li>";
        btnAgendar.disabled = true;
    } else {
        ordenMedica.forEach((item, index) => {
            total += item.precio;
            const li = document.createElement("li");
            li.innerHTML = `
                ${item.nombre} - $${item.precio.toLocaleString('es-CL')}
                <button onclick="eliminarDeOrden(${index})" style="background: red; padding: 2px 5px; margin-left: 10px;">X</button>
            `;
            listaOrden.appendChild(li);
        });
        btnAgendar.disabled = false;
    }

    spanTotal.innerText = total.toLocaleString('es-CL');
}

// ==========================================
// 8. FUNCIONALIDAD DEL "CARRITO"
// ==========================================
// Esta función debe ser global para que el onclick del HTML la encuentre
window.agregarAOrden = (idExamen) => {
    // Buscamos el examen en nuestro catálogo
    const examen = examenesCatalogo.find(e => e.id === idExamen);
    
    if (examen) {
        // 1. Lo agregamos a nuestra variable de estado
        ordenMedica.push(examen);
        // 2. ¡EL PASO CLAVE! Guardamos la variable actualizada en Session Storage
        sessionStorage.setItem("orden_clinica", JSON.stringify(ordenMedica));
        // 3. Volvemos a pintar la orden en pantalla
        renderizarOrden();
    }
};

window.eliminarDeOrden = (index) => {
    ordenMedica.splice(index, 1);
    sessionStorage.setItem("orden_clinica", JSON.stringify(ordenMedica));
    renderizarOrden();
};

// ==========================================
// 9. INICIALIZACIÓN DE LA VISTA
// ==========================================
// Ejecutamos estas funciones apenas cargue el código para que todo se vea bien
renderizarCatalogo();
renderizarOrden();

// ==========================================
// 10. LÓGICA DE CHECKOUT Y VALIDACIÓN (Seguridad Frontend)
// ==========================================
const btnAgendar = document.getElementById("btn-agendar");
const checkoutSection = document.getElementById("checkout-section");
const formCheckout = document.getElementById("form-checkout");

// Al hacer clic en "Confirmar Agendamiento"
btnAgendar.addEventListener("click", () => {
    // Ocultamos el catálogo y mostramos el formulario
    document.getElementById("lista-examenes").style.display = "none";
    document.getElementById("orden-medica").style.display = "none";
    checkoutSection.style.display = "block";
});

// Botón cancelar: vuelve atrás
document.getElementById("btn-cancelar").addEventListener("click", () => {
    document.getElementById("lista-examenes").style.display = "grid";
    document.getElementById("orden-medica").style.display = "block";
    checkoutSection.style.display = "none";
});

// Al enviar el formulario (Validación de Seguridad)
formCheckout.addEventListener("submit", (evento) => {
    evento.preventDefault(); // Evitamos que la página se recargue

    const correo = document.getElementById("input-correo").value;
    const telefono = document.getElementById("input-telefono").value;
    
    let esValido = true;

    // 1. Validación de Correo (Debe tener @ y un punto)
    if (!correo.includes("@") || !correo.includes(".")) {
        document.getElementById("error-correo").style.display = "block";
        esValido = false;
    } else {
        document.getElementById("error-correo").style.display = "none";
    }

    // 2. Validación de Teléfono (Usamos Expresiones Regulares para exigir SOLO números)
    // El ^\d+$ significa: desde el inicio (^) hasta el fin ($), solo dígitos (\d) al menos uno (+)
    const regexNumeros = /^\d+$/; 
    if (!regexNumeros.test(telefono) || telefono.length < 8) {
        document.getElementById("error-telefono").style.display = "block";
        esValido = false;
    } else {
        document.getElementById("error-telefono").style.display = "none";
    }

    // Si todo es seguro y válido, procesamos la "compra"
    if (esValido) {
        finalizarAgendamiento();
    }
});

function finalizarAgendamiento() {
    // 1. Ocultamos el formulario
    checkoutSection.style.display = "none";
    
    // 2. Armamos el resumen para el paciente
    const resumenDiv = document.getElementById("resumen-final");
    let htmlResumen = `<ul>`;
    let total = 0;
    ordenMedica.forEach(item => {
        htmlResumen += `<li>${item.nombre} - $${item.precio.toLocaleString('es-CL')}</li>`;
        total += item.precio;
    });
    htmlResumen += `</ul><hr><strong>Total Pagado: $${total.toLocaleString('es-CL')}</strong>`;
    resumenDiv.innerHTML = htmlResumen;

    // 3. Mostramos la pantalla de éxito
    document.getElementById("mensaje-exito").style.display = "block";

    // 4. EL PASO DE SEGURIDAD CRÍTICO: Limpiar la sesión [cite: 596]
    // Una vez finalizada la compra, no debemos dejar datos sensibles en el navegador
    sessionStorage.removeItem("orden_clinica");
    ordenMedica = []; // Vaciamos la memoria de Javascript
}