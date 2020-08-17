const OPERATORS = ["+", "-", "/", "*"];
const RESULT = "=";
const ENTER = "Enter";
const BAKCSPACE = "Backspace";

/** Visor de la calculadora, para leer/modificar su valor usar {@field textContent} */
const VISOR = document.getElementById("visor");
/** Display de la calculadora, para leer/modificar su valor usar {@field textContent} */
const DISPLAY = document.getElementById("display");
/** 
 * Al precionar 'enter' y se obtiene el resultado se deja en el visor la formula
 * a la vista, con esto logramos que en la siguiente iteracion se vuelva a iniciar
 * con una nueva formula.
 */
var nextValueClearVisor = false;

/**
 * Se separa por terminos las operaciones ingresadas al {@field VISOR}.
 * Cada elemento del vector contendra el numero mas el operador que le sigue.
 * Ejemplo : 10+2*2
 * pos[0] = 10+
 * pos[1] = 2*2
 * @returns vector[string]
 */
function parseAddSub()
{
    let parse = [];

    let lastOperatorPos = 0;

    // Se separa en un vector por terminos (+/-)
    for (let pos = 0; pos < VISOR.textContent.length; pos++)
    {
        let lastElement = (pos == VISOR.textContent.length - 1);
        let char = VISOR.textContent[pos];
        if (char.includes("+", "-"))
        {
            parse.push(VISOR.textContent.slice(lastOperatorPos, lastElement ? pos : pos + 1));
            lastOperatorPos = pos + 1;
        }
    }
    // se agrega al vector la ultima operacion, como no tiene 
    // un operador  al final el codigo de arriba no lo toma por
    // lo que forzamos a hacerlo aqui
    parse.push(VISOR.textContent.slice(lastOperatorPos - VISOR.textContent.length));

    return parse;
}
/**
 * Calcula el resultado de la formula ingresada en el visor
 */
function calculate()
{
    let vector = [];

    /** 
     * 1) Se separa el contenido de {@link VISOR} segun la operacion que contenga.
     *      - Primer etapa de separacion es de acuerdo a los terminos respetando los + y -.
     *      - Ejemplo: 10+2*2
     *      -- pos:0 -> 10+
     *      -- pos:1 -> 2*2
     * 2) Se recorre el vector resolviendo cada posicion del vector por separado, quedando algo como
     *      - pos:0 -> 10+
     *      - pos:1 -> 4
     * 3) Se recorre el vector sumando cada posicion con el siguiente respetando los operadores que quedaron.
     */

    // TODO esto requiere mejor analisis
    if (countOperators() >= 1)
    {
        vector = parseAddSub();

        // se haran 2 foreach para mantener el codigo mas claro.
        // 1) resolver las multiplicaciones y divisiones
        // 2) resolver todas las operaciones.
        let vectorIndex = 0;
        vector.forEach(v =>
        {
            if (v.includes("*", "/"))
            {
                let vPos = 0;

                let result = 0;
                let number1 = 0;
                let number2 = "";

                let lastOperator = "";

                let hasOperator = vPos == vector.length ? true : false;
                // XXX hacemos -1 porque el ultimo caracter sera un signo almenos que sea el ultimo elemento
                for (let pos = 0; pos < v.length - (hasOperator ? -1 : 0); pos++)
                {
                    if (!isNaN(v.charAt(pos)))
                    {
                        // cada numero leido de cada posicion del vector se va
                        // concatenando hasta obtener el numero formado.
                        number2 += v.charAt(pos);
                    }
                    else
                    {
                        // encontramos el operador asique salvamos el {@link number1}
                        // el numero leido de la concatenacion anterior.
                        number1 = parseInt(number2);
                        // se limpia el numero2 a fin de futuros calculos.
                        number2 = "";

                        // si es el primer numero leido no hace falta ningun calculo,
                        // solo sumarlo(defnirlo) como el resultado.
                        if (result == 0)
                        {
                            result = parseInt(number1);
                        }

                        // si no existe operador definido, definimos el que leimos
                        // para llegar a este "else" xD
                        if (lastOperator == "")
                        {
                            lastOperator = v.charAt(pos);
                        }
                        else
                        {
                            // ya se definiio el operador y se leyo el numero que 
                            // seguia asiq podemos realizar la operacion segun el 
                            // operador ingresado.
                            if (lastOperator == "*")
                            {
                                result *= parseInt(number1);
                                lastOperator = "";
                            }
                            else if (lastOperator == "/")
                            {
                                result /= parseInt(number1);
                                lastOperator = "";
                            }
                        }

                        number1 = "";//XXX hace falta limpiarlo?

                    }
                }

                // TODO esto se repite 2 veces, creamos una mini funccion? O.o
                // y ahora sumamos el ultimo valor que leimos y no le hicimos nada
                if (lastOperator == "*")
                {
                    result *= parseInt(number2);
                    lastOperator = "";
                }
                else if (lastOperator == "/")
                {
                    result /= parseInt(number2);
                    lastOperator = "";
                }
                // ------------------------------------

                if (hasOperator)
                {
                    result += v.charAt(v.length - 1);
                }

                // se almacena en el vector el resultado de la operacion
                // en el lugar donde estaba la misma osea que si en
                // esta posicion teniamos "2*2" ahora tendremos "4".
                vector[vectorIndex] = result;
                vPos++;
            }

            vectorIndex++;
        });

        let resultFinal = 0;
        let lastOperator = "";
        vector.forEach(v =>
        {
            // cada "v" trae su operador a excepcion del ultimo, por lo que
            // se verifica con "isNaN" si trae operador y asi sabremos si
            // debemos leerlo todo como un "numero" o como "numero+operador"
            let value = isNaN(v) ? v.slice(0, -1) : v;
            if (resultFinal == 0)
            {
                resultFinal = parseInt(value);
                try
                {
                    lastOperator = v.slice(-1);
                }
                catch (e)
                {
                    // ignore....lanzara una excepcion al leer
                    // el ultimo valor q no contiene operador.
                }
            }
            else
            {
                // a estas alturas solo tendremos operadores de +/-
                if (lastOperator == "+")
                {
                    resultFinal += parseInt(value);
                }
                else
                {
                    resultFinal -= parseInt(value);
                }

                try
                {
                    lastOperator = v.slice(-1);
                }
                catch (e)
                {
                    // ignore....lanzara una excepcion al leer
                    // el ultimo valor q no contiene operador.
                }
            }

        });

        DISPLAY.textContent = "Result: " + resultFinal;
    }
}

/**
 * - Se agrega caracteres al visor de la calculadora.
 * - Se almacena el valor ingresado en memoria.
 * @param {number} value
 */
function addNumberVisor(value)
{
    // Se concatena al valor ya definido en el visor el valor de {@link value}
    if (VISOR.textContent == "0.00" || VISOR.textContent == "0")
    {
        VISOR.textContent = value;
    }
    else
    {
        VISOR.textContent += value;
    }
}

/**
 * Agrega un operador (+,-,/,*) al visor
 * @param {*} value 
 */
function addOperator(value)
{
    // si el operador ingresado es un valor cero no se realiza accion.
    // TODO chequear a futuro para numeros negativos de entrada
    if (VISOR.textContent == "0.00" || VISOR.textContent == "0")
    {
        return;
    }
    // si el ultimo operador es igual al ingresado no se realiza accion
    let lastPos = VISOR.textContent.length - 1;
    if (VISOR.textContent.charAt(lastPos) == value)
    {
        return;
    }
    // si el ultimo caracter es un operador lo
    // borramos para luego insertar el nuevo
    if (OPERATORS.includes(VISOR.textContent.charAt(lastPos)))
    {
        VISOR.textContent = VISOR.textContent.slice(0, -1);
    }

    VISOR.textContent += value;

    if (countOperators() > 1)
    {
        calculate();
    }
}

// TODO pendiente a mejorar.
function countOperators()
{
    let value = 0;
    for (let e = 0; e < VISOR.textContent.length; e++)
    {
        OPERATORS.forEach(o =>
        {
            if (o == VISOR.textContent[e])
            {
                value++;
            }
        });
    }

    return value;
}

/**
 * Remueve el ultimo valor del visor.
 */
function backspace()
{
    // el visor no puede quedar sin numeros, en caso de estar sin valores se debe mostrar el "0".
    if (VISOR.textContent.length == 1)
    {
        VISOR.textContent = "0";
    }
    else
    {
        VISOR.textContent = VISOR.textContent.slice(0, -1);
    }
}

/**
 * Limpia por completo la pantalla.
 * Unicamente llamado desde el html.
 */
function CE()
{
    VISOR.textContent = "0";
}
// ------------------------------------------------------------------------
// AQUI COMIENZA LA MAGIA :D
// ------------------------------------------------------------------------
// Se crea un listener para ver los eventos del teclado.
document.addEventListener("keydown", event =>
{
    let keyPressed = event.key;
    if (!isNaN(keyPressed) && Number.isInteger(parseInt(keyPressed)))
    {
        // si se indica se borrara la pantalla antes de ingresar
        // un nuevo valor.
        if (nextValueClearVisor)
        {
            CE();
            nextValueClearVisor = false;
        }
        addNumberVisor(keyPressed);
        calculate();
        return;
    }
    if (OPERATORS.includes(keyPressed))
    {
        addOperator(keyPressed);
        return;
    }
    if (keyPressed == BAKCSPACE)
    {
        backspace();
        calculate();
        return;
    }
    if (keyPressed == ENTER)
    {
        calculate();
        nextValueClearVisor = true;
        return;
    }
});

