const OPERATORS = ["+", "-", "/", "*"];
const OPERATORS_CALC = ["+", "-", "÷", "×"];
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
var clearVisor = false;

/**
 * Se realiza un sencillo calculo de acuerdo lo que se pase por 'lastOperator'.
 * - Example 
 * @param {number} result 
 * @param {number} number
 * @param {string(+,-,/,*)} lastOperator 
 */
function calculateOperator(result, number, lastOperator)
{
    switch (lastOperator)
    {
        case '×':
            result *= parseInt(number);
            break;
        case '÷':
            result /= parseInt(number);
            break;
        case '+':
            result += parseInt(number);
            break;
        case '-':
            result -= parseInt(number);
            break;
    }
    return result;
}
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
        if (char.includes("+") || char.includes("-"))
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
    let listOperation = [];

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
    listOperation = parseAddSub();

    // se haran 2 foreach para mantener el codigo mas claro.
    // 1) resolver las multiplicaciones y divisiones
    // 2) resolver todas las operaciones.
    let index = 0;
    listOperation.forEach(operation =>
    {
        if (operation.includes("×") || operation.includes("÷"))
        {
            let result = 0;
            let number1 = 0;
            let number2 = "";

            let lastOperator = "";

            for (let pos = 0; pos < operation.length; pos++)
            {
                if (!isNaN(operation.charAt(pos)))
                {
                    // cada numero leido de cada posicion del vector se va
                    // concatenando hasta obtener el numero formado.
                    number2 += operation.charAt(pos);
                }
                else
                {

                    // se define el operador encontrado
                    lastOperator = operation.charAt(pos);

                    // encontramos el operador asique salvamos el {@link number1}
                    // el numero leido de la concatenacion anterior.
                    number1 = parseInt(number2);
                    // se limpia el numero2 a fin de futuros calculos.
                    number2 = "";

                    // si es el primer numero leido no hace falta ningun calculo,
                    // solo sumarlo(definirlo) como el resultado.
                    if (result == 0)
                    {
                        result = parseInt(number1);
                    }
                    else
                    {
                        // ya se definiio el operador y se leyo el numero que 
                        // seguia asiq podemos realizar la operacion segun el 
                        // operador ingresado.
                        result = calculateOperator(result, number1, lastOperator);
                    }
                }
            }
            // y ahora sumamos el ultimo valor que leimos y no le hicimos nada
            result = calculateOperator(result, number2, lastOperator);
            lastOperator = "";

            // ------------------------------------

            let hasOperator = operation.charAt(- 1);
            if (isNaN(hasOperator))
            {
                result += hasOperator;
            }

            // se almacena en el vector el resultado de la operacion
            // en el lugar donde estaba la misma osea que si en
            // esta posicion teniamos "2*2" ahora tendremos "4".
            listOperation[index] = result;
        }

        index++;
    });

    let result = 0;
    let lastOperator = "";
    listOperation.forEach(operation =>
    {
        // si tiene operador final se separa.-
        if (isNaN(operation))
        {
            lastOperator = operation.slice(-1);
            operation = operation.slice(0, -1);
        }
        // cada "operation" trae su operador a excepcion del ultimo, por lo que
        // se verifica con "isNaN" si trae operador o no y asi sabremos si
        // debemos leerlo todo como un "numero" o como "numero+operador"

        if (result == 0)
        {
            result = parseInt(operation);
        }
        else
        {
            // a estas alturas solo tendremos operadores de +/-
            result = calculateOperator(result, operation, lastOperator);
        }
    });


    DISPLAY.textContent = "Result: " + result;
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
 * Agrega un operador (+,-,÷,×) al visor
 * @param {*} value 
 */
function addOperator(value)
{
    switch (value)
    {
        case '/':
            value = '÷';
            break;
        case '*':
            value = '×';
            break;
    }

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
    if (OPERATORS_CALC.includes(VISOR.textContent.charAt(lastPos)))
    {
        VISOR.textContent = VISOR.textContent.slice(0, -1);
    }

    VISOR.textContent += value;

    if (countOperators() > 1)
    {
        //calculate();
    }
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
function ce()
{
    VISOR.textContent = "0";
}
// ------------------------------------------------------------------------
// AQUI COMIENZA LA MAGIA :D
// ------------------------------------------------------------------------
// Se crea un listener para ver los eventos del teclado.
// alt+94  -> ^ (potencia)
// alt+241 -> ± 
// alt+158 -> ×
// alt+246 -> ÷
// √ˉ
document.addEventListener("keydown", event =>
{
    let keyPressed = event.key;
    if (!isNaN(keyPressed) && Number.isInteger(parseInt(keyPressed)))
    {
        // si se indica se borrara la pantalla antes de ingresar
        // un nuevo valor.
        if (clearVisor)
        {
            ce();
            clearVisor = false;
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
        //calculate();
        return;
    }
    if (keyPressed == ENTER)
    {
        // TODO chequear si la ecuacion termina con un operador....eliminarlo?
        calculate();
        clearVisor = true;
        return;
    }
});

