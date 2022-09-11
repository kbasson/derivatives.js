function get_derivative(y) { //Given an expression, return it's derivative by splitting into terms

    //console.log(`y = ${y}`);
    let deriv = derivative(y); //Get derivative of entire expression

    if (deriv != "INVALID") { //If derivative of entire expression exists

        //console.log(`deriv = ${deriv}`);
        return deriv; //Return derivative in brackets

    } else { //If expression has to be processed before derivative can be found

        //REPLACE BRACKETED EXPRESSIONS WITH PLACEHOLDERS

        let temp = y; //Copy string
        let expressions = []; //Stores expressions replaced by placeholder
        let exp_index = 0; //Current index of expressions array
        let brackets = []; //Stores indices of open brackets
    
        for (let i = 0; i < temp.length; i++) { //For all chars in temp
    
            if (temp[i] === '(') { //If current char is open bracket
                
                brackets.push(i); //Add current index to array
    
            }
            
            if (temp[i] === ')' && brackets.length > 0) { //If current char is closed bracket
    
                let openBracket = brackets.pop(); //Get most recent open brack index
                let closeBracket = i; //Get close bracket index, which is current index
                
                if (openBracket > 0 || closeBracket < temp.length - 1) { //If not wrapping brackets
    
                    let exp = temp.substring(openBracket, closeBracket + 1); //Get expression inside brackets
                    expressions.push(exp); //Add expression to array
    
                    temp = temp.replace(exp, `index_${exp_index++}`); //Replace expression with placeholder
                    i = openBracket - 1; //Reset index to start of str
                    
                } else { //If wrapping brackets
    
                    //console.log("Wrapping Brackets");
                    y = get_derivative(y.substring(1, y.length - 1)); //Get derivative of expression without wrapping brackets
                    return y; //Return derivative of expression without wrapping brackets
    
                }
    
            }
    
        }
    
        //Get all functions with placeholders
        let arr = temp.match(/(sinh|cosh|tanh|csch|sech|coth|arcsinh|arccosh|arctanh|arccsch|arcsech|arccoth|sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|arccsc|arcsec|arccot|abs|log|ln|sqrt)index_\d+/g);
        if (arr == null) arr = [];
    
        for (let i = 0; i < arr.length; i++) { //Replace function strings with placeholders
    
            expressions.push(arr[i]);
            temp = temp.replace(arr[i], `index_${exp_index++}`);
    
        }

        //console.log(temp);
        //console.log(expressions);

        arr = temp.match(/\-index_\d+/g); //Get expressions with negative sign in front
        
        if (arr != null) {

            let parent_index = -1;

            for (let i = 0; i < arr.length; i++) { //Replace function strings with placeholders
    
                //console.log(arr);
                
                //GET EXPRESSION AT INDEX
                let index = arr[i].replace("-index_", "");
                let expression = expressions[index]; //Replace placeholders
                //console.log(expression);
    
                //REMOVE SURROUNDING BRACKETS
                while (expression[0] == '(') expression = expression.substring(1, expression.length - 1);
                //console.log(expression);
    
                //NEGATE EXPRESSION
                let terms = expression.split(/(\+|\-)/g);
                //console.log(terms);
    
                for (let k = 0; k < terms.length; k++) {
    
                    if (terms[k] == "+" || terms[k] == "-" || terms[k] == '') continue; //If term is addition/subtraction/empty continue
                    
                    terms[k] = "-" + terms[k];
    
                }
    
                //REPLACE OLD EXPRESSION WITH NEGATED EXPRESSION
                expression = simplifyOperations(terms.join(""));
                expressions[index] = "(" + expression + ")";
    
                if (parent_index == -1) temp = simplifyOperations(temp.replace(arr[i], "+" + arr[i].substring(1, arr[i].length))); //Remove negative sign
                else expressions[parent_index] = simplifyOperations(expressions[parent_index].replace(arr[i], "+" + arr[i].substring(1, arr[i].length))); //Remove negative sign
    
                //console.log(expression);
                //console.log(expressions);
                //console.log(temp);
    
                arr = expression.match(/\-index_\d+/g); //Get expressions with negative sign in front
                if (arr == null) arr = [];
                else {i = -1; parent_index = index;} 
    
            }

            y = replacePlaceholders(temp, expressions);
            //console.log(y);

            return get_derivative(y);

        }
            
        //console.log(`temp = ${temp}`);
        //console.log(expressions);
        
        arr = temp.split(/(\+|\-)/g); //Split expression into addition/subtraction terms

        if (arr.length > 1) { //If multiple addition/subtraction terms exist

            //console.log(arr);

            for (let i = 0; i < arr.length; i++) { //For each term
    
                if (arr[i] == "+" || arr[i] == "-" || arr[i] == '') continue; //If term is addition/subtraction/empty continue
        
                arr[i] = replacePlaceholders(arr[i], expressions); //Get expression
                arr[i] = "(" + get_derivative(arr[i]) + ")"; //Get derivative of expression
                //console.log(`arr[${i}] = ${arr[i]}`);

            }

            deriv = arr.join("");
            //console.log(`deriv = ${deriv}`);

            return deriv;

        } 

        let mult = temp.indexOf("*"); //Index of multiplication symbol for product rule
        let div = temp.indexOf("/"); //Index of division symbol for quotient rule

        if (mult == div) { //If no product/quotient rule needed

            let exp = temp.indexOf("^");

            if (exp >= 0) { //If exponent rule needed

                //Get base and power of exponent with placeholders
                let base = temp.substring(0, exp);
                let power = temp.substring(exp + 1, temp.length);

                //Remove placeholders on base and power
                base = replacePlaceholders(base, expressions);
                power = replacePlaceholders(power, expressions);

                //console.log(`base = ${base}`);
                //console.log(`power = ${power}`);
                
                exp = `${power}*ln(${base})`;  
                deriv = `${base}^${power}*(${get_derivative(exp)})`;

                exp = `(0)*(ln(${base}))`.split("");
                for (let i = 0; i < exp.length; i++) if ((".+*^()/").indexOf(exp[i]) >= 0) exp[i] = "\\" + exp[i];
                exp = exp.join("");

                deriv = deriv.replace(new RegExp(exp, "g"), "0");

                //console.log(`exp = ${exp}`);
                //console.log(`deriv = ${deriv}`);

                return deriv; //Return result of exponential derivative

            } else { //If (somehow) no derivative rules apply

                //console.log("INVALID DERIVATIVE");
                return "INVALID";

            }

        } else if (mult == -1) { //If no product rule needed

            let f = temp.substring(0, div); //Get f() with placeholders
            let g = temp.substring(div + 1, temp.length); //Get g() with placeholders

            f = replacePlaceholders(f, expressions); //Remove placeholders from f()
            g = replacePlaceholders(g, expressions); //Remove placeholders from g()
            return quotientRule(f, g);

        } else if (div == -1) { //If no quotient rule needed

            let f = temp.substring(0, mult); //Get f() with placeholders
            let g = temp.substring(mult + 1, temp.length); //Get g() with placeholders

            f = replacePlaceholders(f, expressions); //Remove placeholders from f()
            g = replacePlaceholders(g, expressions); //Remove placeholders from g()
            return productRule(f, g); //Return product rule result

        } else if (mult < div) { //If multiplication symbol appears before division symbol

            let f = temp.substring(0, mult); //Get f() with placeholders
            let g = temp.substring(mult + 1, temp.length); //Get g() with placeholders

            f = replacePlaceholders(f, expressions); //Remove placeholders from f()
            g = replacePlaceholders(g, expressions); //Remove placeholders from g()    
            return productRule(f, g); //Return product rule result
            
        } else { //If multiplication symbol appears after division symbol
    
            let f = temp.substring(0, div); //Get f() with placeholders
            let g = temp.substring(div + 1, temp.length); //Get g() with placeholders

            f = replacePlaceholders(f, expressions); //Remove placeholders from f()
            g = replacePlaceholders(g, expressions); //Remove placeholders from g()
            return quotientRule(f, g);

        }

    }

}

function derivative(y) {

    //console.log(y);

    //INVALID BASE CASES
    if (y.replace(/ /g, "") == "") return "INVALID";; //If y is empty, return "INVALID"
    if (y[0] == '(') return "INVALID"; //If expression covered in brackets, return "INVALID"

    //CHECK IF EXPRESSION IS CONSTANT
    let perfect_match = y.match(/(-?(\d+(?:\.\d+)?|e|π|f|sinh|cosh|tanh|csch|sech|coth|arcsinh|arccosh|arctanh|arccsch|arcsech|arccoth|sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|arccsc|arcsec|arccot|abs|log|ln|sqrt)|\(|\)|\^|\/|\*|\+)/g);
    if (perfect_match != null) perfect_match = perfect_match.join("");
    else perfect_match = "";

    //BASE DERIVATIVE CASES
    if (perfect_match == y) return "0"; //If constant expression, return 0
    if (y == "x") return "1"; //If y = x, return 1
    if (y == "-x") return "-1"; //If y = -x, return -1

    let temp = y; //Copy string
    let brackets = []; //Stores indices of open brackets

    for (let i = 0; i < temp.length; i++) { //For all chars in temp

        if (temp[i] === '(') { //If current char is open bracket
            
            brackets.push(i); //Add current index to array

        }
        
        if (temp[i] === ')' && brackets.length > 0) { //If current char is closed bracket

            let openBracket = brackets.pop(); //Get most recent open brack index
            let closeBracket = i; //Get close bracket index, which is current index

            let exp = temp.substring(openBracket, closeBracket + 1); //Get expression inside brackets
            temp = temp.replace(exp, `index`); //Replace expression with placeholder
            i = openBracket - 1; //Reset index to start of str

        }

    }

    //console.log(`temp = ${temp}`);
    perfect_match = (/^\-?(sinh|cosh|tanh|csch|sech|coth|arcsinh|arccosh|arctanh|arccsch|arcsech|arccoth|sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|arccsc|arcsec|arccot|abs|log|ln|sqrt)index$/g).test(temp); //Check if expression is a function
    //console.log(`perfect_match = ${perfect_match}`);

    if (perfect_match == false) { //If expression is not a function, return y

        return "INVALID";

    } else { //If expression is a perfect function, return its derivative

        let is_negative = (y[0] == '-');
        if (is_negative) y = y.substring(1, y.length);

        let op = y.match(/(sinh|cosh|tanh|csch|sech|coth|arcsinh|arccosh|arctanh|arccsch|arcsech|arccoth|sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|arccsc|arcsec|arccot|abs|log|ln|sqrt)/g)[0]; //Get function
        let exp = y.substring(0, y.length - 1).replace(op + "(", ""); //Get expression inside function

        //console.log(`op = ${op}`);
        //console.log(`exp = ${exp}`);

        //HYPERBOLIC FUNCTIONS
        if (op == "sinh") exp = `cosh(${exp})*(${get_derivative(exp)})`; //Get sinh derivative
        if (op == "cosh") exp = `sinh(${exp})*(${get_derivative(exp)})`; //Get cosh derivative
        if (op == "tanh") exp = `sech(${exp})^2*(${get_derivative(exp)})`; //Get tanh derivative
        if (op == "csch") exp = `-csch(${exp})*coth(${exp})*(${get_derivative(exp)})`; //Get csch derivative
        if (op == "sech") exp = `-sech(${exp})*tanh(${exp})*(${get_derivative(exp)})`; //Get sech derivative
        if (op == "coth") exp = `-csch(${exp})^2*(${get_derivative(exp)})`; //Get coth derivative
        
        //ARC HYPERBOLIC FUNCTIONS
        if (op == "arcsinh") exp = `1/sqrt((${exp})^2+1)*(${get_derivative(exp)})`; //Get arcsinh derivative
        if (op == "arccosh") exp = `1/sqrt((${exp})^2-1)*(${get_derivative(exp)})`; //Get arccosh derivative
        if (op == "arctanh") exp = `1/sqrt(1-(${exp})^2)*(${get_derivative(exp)})`; //Get arctanh derivative
        if (op == "arccsch") exp = `-1/(abs(${exp})*sqrt((${exp})^2+1)*(${get_derivative(exp)})`; //Get arccsch derivative
        if (op == "arcsech") exp = `-1/((${exp})*sqrt(1-(${exp})^2))*(${get_derivative(exp)})`; //Get arcsech derivative
        if (op == "arccoth") exp = `1/(1-(${exp})^2)*(${get_derivative(exp)})`; //Get arccoth derivative

        //TRIG FUNCTIONS
        if (op == "sin") exp = `cos(${exp})*(${get_derivative(exp)})`; //Get sin derivative
        if (op == "cos") exp = `-sin(${exp})*(${get_derivative(exp)})`; //Get cos derivative
        if (op == "tan") exp = `sec(${exp})^2*(${get_derivative(exp)})`; //Get tan derivative
        if (op == "sec") exp = `sec(${exp})*tan(${exp})*(${get_derivative(exp)})`; //Get sec derivative
        if (op == "csc") exp = `-csc(${exp})*cot(${exp})*(${get_derivative(exp)})`; //Get csc derivative
        if (op == "cot") exp = `-csc(${exp})^2*(${get_derivative(exp)})`; //Get cot derivative

        //ARC TRIG FUNCTIONS
        if (op == "arcsin") exp = `1/sqrt(1-(${exp})^2)*(${get_derivative(exp)})`; //Get arcsin derivative
        if (op == "arccos") exp = `-1/sqrt(1-(${exp})^2)*(${get_derivative(exp)})`; //Get arccos derivative
        if (op == "arctan") exp = `1/(1+(${exp})^2)*(${get_derivative(exp)})`; //Get arctan derivative
        if (op == "arcsec") exp = `1/(${exp}*sqrt((${exp})^2-1))*(${get_derivative(exp)})`; //Get arcsec derivative
        if (op == "arccsc") exp = `-1/(${exp}*sqrt((${exp})^2-1))*(${get_derivative(exp)})`; //Get arccsc derivative
        if (op == "arccot") exp = `-1/(1+(${exp})^2)*(${get_derivative(exp)})`; //Get arccot derivative

        //LOGARITHMIC FUNCTIONS
        if (op == "ln") exp = `1/(${exp})*(${get_derivative(exp)})`; //Get ln derivative
        if (op == "log") exp = `1/(${Math.LN10}*(${exp}))*(${get_derivative(exp)})`; //Get log derivative

        //MISC FUNCTIONS
        if (op == "abs") exp = `(${exp})/abs(${exp})*(${get_derivative(exp)})`; //Get abs derivative
        if (op == "sqrt") exp = `0.5*(${exp})^(-0.5)*(${get_derivative(exp)})`; //Get sqrt derivative

        if (is_negative) exp = `-(${exp})`;
        return exp; //Replace function with its derivative   
        
    }

}

function productRule(f, g) { //Given 2 functions, return it's product rule derivative

    //GET DERIVATIVE USING PRODUCT RULE
    let deriv = `(${f})*(${get_derivative(g)})+(${get_derivative(f)})*(${g})`;
    //console.log(`deriv = ${deriv}`);
    
    return deriv; //Return result

}

function quotientRule(f, g) { //Given 2 functions, return it's quotient rule derivative

    //GET DERIVATIVE USING QUOTIENT RULE
    let deriv = `((${g})*(${get_derivative(f)})-(${f})*(${get_derivative(g)}))/(${g})^2`;
    //console.log(`deriv = ${deriv}`);
    
    return deriv; //Return result

}

function replacePlaceholders(y, expressions) { //Remove placeholder strings from an expression

    let matches = y.match(/index_\d+/g); //Get current placeholder strings
    if (matches == null) matches = [];

    for (let i = 0; i < matches.length; i++) { //For all placeholder strings

        let index = matches[i].replace("index_", ""); //Get index of current function
        y = y.replace(matches[i], expressions[index]); //Replace placeholder string with original function

        matches = y.match(/index_\d+/g); //Get current placeholder strings
        if (matches == null) break;
        else i = -1;

    }

    return y;

}
