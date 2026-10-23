const CLAVE_MASCOTAS = "mascotas";

function obtenerMascotas() {

    const texto = localStorage.getItem(CLAVE_MASCOTAS);

    if (texto === null) {
        return [];
    }

    return JSON.parse(texto);
}

function guardarMascotas(mascotas) {
    // Convertimos el array a texto y lo guardamos
    localStorage.setItem(CLAVE_MASCOTAS, JSON.stringify(mascotas));
}

const formulario = document.getElementById("formMascota");
const inputNombreMascota = document.getElementById("nombreMascota");
const inputNombreDuenio = document.getElementById("nombreDuenio");
const inputColor = document.getElementById("color");
const inputEdad = document.getElementById("edad");
const inputPeso = document.getElementById("peso");
const cuadroError = document.getElementById("mensajeError");

function mostrarError(mensaje) {
    cuadroError.textContent = mensaje;
    cuadroError.classList.remove("d-none"); 
}

// Esconde el cuadro de error
function ocultarError() {
    cuadroError.classList.add("d-none");
}

function generarId() {
    return crypto.randomUUID();
}

formulario.addEventListener("submit", function (evento) {

    evento.preventDefault();

    const nombreMascota = inputNombreMascota.value.trim();
    const nombreDuenio = inputNombreDuenio.value.trim();
    const color = inputColor.value.trim();
    const edadTexto = inputEdad.value.trim();
    const pesoTexto = inputPeso.value.trim();

    if (nombreMascota === "" || nombreDuenio === "" || color === "") {
        mostrarError("Completá todos los campos: el nombre, el dueño y el color.");
        return;
    }

    const edad = Number(edadTexto);
    const peso = Number(pesoTexto);

    if (edadTexto === "" || !Number.isInteger(edad) || edad < 0) {
        mostrarError("La edad debe ser un número entero, 0 o mayor.");
        return;
    }

    if (pesoTexto === "" || isNaN(peso) || peso <= 0) {
        mostrarError("El peso debe ser un número mayor a 0.");
        return;
    }

    ocultarError();

    const idEditando = inputId.value;
    const mascotas = obtenerMascotas();

    if (idEditando === "") {
        const mascota = {
            idMascota: generarId(),
            nombreMascota: nombreMascota,
            nombreDuenio: nombreDuenio,
            color: color,
            edad: edad,
            peso: peso
        };
        mascotas.push(mascota);
    } else {
        const mascota = mascotas.find(function (m) {
            return m.idMascota === idEditando;
        });
        mascota.nombreMascota = nombreMascota;
        mascota.nombreDuenio = nombreDuenio;
        mascota.color = color;
        mascota.edad = edad;
        mascota.peso = peso;
    }

    guardarMascotas(mascotas);
    salirModoEdicion(); 
    mostrarMascotas();  
});

function crearCelda(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}

function mostrarMascotas() {
    const mascotas = obtenerMascotas();

    const tbody = document.getElementById("tablaMascotas");
    const mensajeVacio = document.getElementById("sinMascotas");
    const total = document.getElementById("totalMascotas");

    tbody.innerHTML = "";

    mascotas.forEach(function (mascota) {
        const fila = document.createElement("tr");

        fila.appendChild(crearCelda(mascota.nombreMascota));
        fila.appendChild(crearCelda(mascota.nombreDuenio));
        fila.appendChild(crearCelda(mascota.color));
        fila.appendChild(crearCelda(mascota.edad));
        fila.appendChild(crearCelda(mascota.peso));

        const celdaAcciones = document.createElement("td");
        celdaAcciones.className = "text-end";
        celdaAcciones.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-primary btn-editar" data-id="${mascota.idMascota}">Editar</button>
            <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${mascota.idMascota}">Eliminar</button>
        `;
        fila.appendChild(celdaAcciones);

        tbody.appendChild(fila);
    });

    total.textContent = mascotas.length;

    if (mascotas.length === 0) {
        mensajeVacio.classList.remove("d-none");
    } else {
        mensajeVacio.classList.add("d-none");
    }
}

mostrarMascotas();

const inputId = document.getElementById("idMascota");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

function salirModoEdicion() {
    formulario.reset();
    inputId.value = "";
    tituloFormulario.textContent = "Nueva mascota";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("d-none");
    ocultarError();
}

function editarMascota(id) {
    const mascotas = obtenerMascotas();
    const mascota = mascotas.find(function (m) {
        return m.idMascota === id;
    });

    inputId.value = mascota.idMascota; 
    inputNombreMascota.value = mascota.nombreMascota;
    inputNombreDuenio.value = mascota.nombreDuenio;
    inputColor.value = mascota.color;
    inputEdad.value = mascota.edad;
    inputPeso.value = mascota.peso;

    
    tituloFormulario.textContent = "Editar mascota";
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.classList.remove("d-none");

    inputNombreMascota.focus(); 
}


function eliminarMascota(id) {
    
    const confirmado = confirm("¿Seguro que querés eliminar esta mascota?");
    if (!confirmado) {
        return; // si canceló, no hacemos nada
    }

    
    const mascotas = obtenerMascotas().filter(function (m) {
        return m.idMascota !== id;
    });
    guardarMascotas(mascotas);

   
    if (inputId.value === id) {
        salirModoEdicion();
    }

    mostrarMascotas();
}


btnCancelar.addEventListener("click", salirModoEdicion);


document.getElementById("tablaMascotas").addEventListener("click", function (evento) {
    // closest("button") busca el botón en el que se hizo clic
    const boton = evento.target.closest("button");
    if (boton === null) {
        return; 
    }

    const id = boton.dataset.id; 

    if (boton.classList.contains("btn-eliminar")) {
        eliminarMascota(id);
    } else if (boton.classList.contains("btn-editar")) {
        editarMascota(id);
    }
});