
const formulario = document.getElementById("formVeterinario");
const inputId = document.getElementById("idVeterinario");
const inputMatricula = document.getElementById("matricula");
const inputNombre = document.getElementById("nombre");
const inputEspecializacion = document.getElementById("especializacion");
const inputValorConsulta = document.getElementById("valorConsulta");
const cuadroError = document.getElementById("mensajeError");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

const CLAVE_VETERINARIOS = "veterinarios";

function obtenerVeterinarios() {
    const texto = localStorage.getItem(CLAVE_VETERINARIOS);
    if (texto === null) {
        return [];
    }
    return JSON.parse(texto);
}

function guardarVeterinarios(veterinarios) {
    localStorage.setItem(CLAVE_VETERINARIOS, JSON.stringify(veterinarios));
}

function generarId() {
    return crypto.randomUUID();
}

function mostrarError(mensaje) {
    cuadroError.textContent = mensaje;
    cuadroError.classList.remove("d-none");
}

function ocultarError() {
    cuadroError.classList.add("d-none");
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS"
    }).format(valor);
}

function salirModoEdicion() {
    formulario.reset();
    inputId.value = "";
    tituloFormulario.textContent = "Nuevo veterinario";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("d-none");
    ocultarError();
}

function crearCelda(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}

function mostrarVeterinarios() {
    const veterinarios = obtenerVeterinarios();

    const tbody = document.getElementById("tablaVeterinarios");
    const mensajeVacio = document.getElementById("sinVeterinarios");
    const total = document.getElementById("totalVeterinarios");

    tbody.innerHTML = "";

    veterinarios.forEach(function (vet) {
        const fila = document.createElement("tr");

        fila.appendChild(crearCelda(vet.matricula));
        fila.appendChild(crearCelda(vet.nombre));
        fila.appendChild(crearCelda(vet.especializacion));
        fila.appendChild(crearCelda(formatearMoneda(vet.valorConsulta)));

        const celdaAcciones = document.createElement("td");
        celdaAcciones.className = "text-end";
        celdaAcciones.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-primary btn-editar" data-id="${vet.idVeterinario}">Editar</button>
            <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${vet.idVeterinario}">Eliminar</button>
        `;
        fila.appendChild(celdaAcciones);

        tbody.appendChild(fila);
    });

    total.textContent = veterinarios.length;

    if (veterinarios.length === 0) {
        mensajeVacio.classList.remove("d-none");
    } else {
        mensajeVacio.classList.add("d-none");
    }
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = inputNombre.value.trim();
    const especializacion = inputEspecializacion.value.trim();
    const matriculaTexto = inputMatricula.value.trim();
    const valorTexto = inputValorConsulta.value.trim();

    // ----- VALIDACIONES -----
    if (nombre === "" || especializacion === "") {
        mostrarError("Completá el nombre y la especialización.");
        return;
    }

    const matricula = Number(matriculaTexto);
    const valorConsulta = Number(valorTexto);

    if (matriculaTexto === "" || !Number.isInteger(matricula) || matricula <= 0) {
        mostrarError("La matrícula debe ser un número entero mayor a 0.");
        return;
    }

    if (valorTexto === "" || isNaN(valorConsulta) || valorConsulta <= 0) {
        mostrarError("El valor de la consulta debe ser un número mayor a 0.");
        return;
    }

    const idEditando = inputId.value;
    const veterinarios = obtenerVeterinarios();

    // La matrícula no puede repetirse (ignoramos al veterinario que estamos editando)
    const matriculaRepetida = veterinarios.some(function (v) {
        return v.matricula === matricula && v.idVeterinario !== idEditando;
    });
    if (matriculaRepetida) {
        mostrarError("Ya existe un veterinario con esa matrícula.");
        return;
    }

    ocultarError();

    if (idEditando === "") {
        veterinarios.push({
            idVeterinario: generarId(),
            matricula: matricula,
            nombre: nombre,
            especializacion: especializacion,
            valorConsulta: valorConsulta
        });
    } else {
        const vet = veterinarios.find(function (v) {
            return v.idVeterinario === idEditando;
        });
        vet.matricula = matricula;
        vet.nombre = nombre;
        vet.especializacion = especializacion;
        vet.valorConsulta = valorConsulta;
    }

    guardarVeterinarios(veterinarios);
    salirModoEdicion();
    mostrarVeterinarios();
});


function editarVeterinario(id) {
    const vet = obtenerVeterinarios().find(function (v) {
        return v.idVeterinario === id;
    });

    inputId.value = vet.idVeterinario;
    inputMatricula.value = vet.matricula;
    inputNombre.value = vet.nombre;
    inputEspecializacion.value = vet.especializacion;
    inputValorConsulta.value = vet.valorConsulta;

    tituloFormulario.textContent = "Editar veterinario";
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.classList.remove("d-none");

    inputMatricula.focus();
}

function eliminarVeterinario(id) {
    const confirmado = confirm("¿Seguro que querés eliminar este veterinario?");
    if (!confirmado) {
        return;
    }

    const veterinarios = obtenerVeterinarios().filter(function (v) {
        return v.idVeterinario !== id;
    });
    guardarVeterinarios(veterinarios);

    if (inputId.value === id) {
        salirModoEdicion();
    }

    mostrarVeterinarios();
}

btnCancelar.addEventListener("click", salirModoEdicion);

document.getElementById("tablaVeterinarios").addEventListener("click", function (evento) {
    const boton = evento.target.closest("button");
    if (boton === null) {
        return;
    }

    const id = boton.dataset.id;

    if (boton.classList.contains("btn-eliminar")) {
        eliminarVeterinario(id);
    } else if (boton.classList.contains("btn-editar")) {
        editarVeterinario(id);
    }
});


mostrarVeterinarios();