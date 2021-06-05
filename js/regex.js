function executa(event) {
  event.preventDefault();

  limparResultados();
  var valores = pegaValoresDoForm();

  var resultados = executaRegex(valores);

  imprimeResultadoNoInput(resultados);
  highlightResultados(resultados, valores.target);
}

function executaRegex(valores) {
  var textoPattern = valores.pattern; //montaPatternDeDataMaisLegivel();
  var textoTarget = valores.target;
  var mostraIndex = valores.mostraIndex;
  var mostraGrupos = valores.mostraGrupos;

  var resultados = [];
  var resultado = null;

  var objetoRegex = new RegExp(textoPattern, "g");

  while ((resultado = objetoRegex.exec(textoTarget))) {
    if (resultado[0] === "") {
      throw Error("Regex retornou valor vazio.");
    }

    console.log("Resultado: " + resultado[0]);

    resultados.push(
      geraResultado(
        mostraGrupos ? resultado.join(" ||| ") : resultado[0],
        resultado.index,
        objetoRegex.lastIndex,
        mostraIndex,
      ),
    );
  }

  logaTempoDeExecucao(textoPattern, textoTarget);

  return resultados;
}

function geraResultado(resultado, index, lastIndex, mostraIndex) {
  var textoIndex = mostraIndex ? " [" + index + "-" + lastIndex + "]" : "";

  return {
    resultado: resultado + textoIndex,
    index: index,
    lastIndex: lastIndex,
  };
}

function logaTempoDeExecucao(textoPattern, textoTarget) {
  var pObjetoRegex = new RegExp(textoPattern, "g");
  var ini = performance.now();
  pObjetoRegex.test(textoTarget);
  var fim = performance.now();
  console.log("Tempo de execução (ms) " + (fim - ini));
}

function imprimeResultadoNoInput(resultados) {
  var inputResultado = document.querySelector("#resultado");
  var labelResultado = document.querySelector("#labelResultados");

  labelResultado.innerHTML = resultados.length + " Matches (resultados)";

  var resultadosComoArray = resultados.map(function (item) {
    return item.resultado;
  });

  labelResultado.innerHTML =
    resultadosComoArray.length + " Matches (resultados)";

  if (resultadosComoArray.length > 0) {
    inputResultado.value = resultadosComoArray.join(" | ");
    inputResultado.style.borderStyle = "solid";
    inputResultado.style.borderColor = "lime"; //verde
  } else {
    inputResultado.placeholder = "Sem matches (resultados)";
    inputResultado.value = "";
    inputResultado.style.borderStyle = "solid";
    inputResultado.style.borderColor = "red";
  }
}

function highlightResultados(resultados, texto) {
  var item = null;
  var indexBegin = 0;
  var conteudo = "";

  while ((item = resultados.shift()) != null) {
    conteudo += semHighlight(
      escapeHtml(texto.substring(indexBegin, item.index)),
    );
    conteudo += comHighlight(
      escapeHtml(texto.substring(item.index, item.lastIndex)),
    );
    indexBegin = item.lastIndex;
  }

  //sobrou algum texto?
  if (texto.length - indexBegin > 0) {
    conteudo += semHighlight(
      escapeHtml(texto.substring(indexBegin, texto.length)),
    );
  }

  document.querySelector("#highlightText").innerHTML = conteudo;
}

function semHighlight(texto) {
  return texto;
  //return "<s>" + texto + "</s>";
}

function comHighlight(texto) {
  return "<span class='bg-primary'>" + texto + "</span>";
}

function escapeHtml(string) {
  return string
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pegaValoresDoForm() {
  var inputTarget = document.querySelector("#target");
  var inputPattern = document.querySelector("#pattern");
  inputPattern.focus();

  var checkboxIndex = document.querySelector("#mostraIndex");
  var checkboxGroups = document.querySelector("#mostraGrupos");

  _verifiqueInputs(inputTarget, inputPattern);

  console.log("Target:  " + inputTarget.value);
  console.log("Pattern: " + inputPattern.value.trim());

  return {
    target: inputTarget.value.trim(),
    pattern: inputPattern.value,
    mostraIndex: checkboxIndex.checked,
    mostraGrupos: checkboxGroups.checked,
  };
}

function _verifiqueInputs(inputTarget, inputPattern) {
  if (!inputTarget.value) {
    inputTarget.placeholder = "Digite um target";
  }

  if (!inputPattern.value) {
    inputPattern.placeholder = "Digite um pattern";
  }

  if (!inputTarget.value || !inputPattern.value) {
    throw Error("Valores invalidos");
  }
}

function limparResultados() {
  console.clear();
  document.querySelector("#labelResultados").innerHTML =
    "0 Matches (resultados)";
  document.querySelector("#resultado").value = "";
  document.querySelector("#resultado").placeholder = "sem resultado";
  document.querySelector("#highlightText").innerHTML = "<em>sem resultado</em>";
}

function montaPatternDeDataMaisLegivel() {
  var DIA = "[0123]?\\d";
  var _DE_ = "\\s+(de )?\\s*";
  var MES = "[A-Za-z][a-zç]{3,8}";
  var ANO = "[12]\\d{3}";
  return DIA + _DE_ + MES + _DE_ + ANO;
}

// Âncoras
// \b - word boundary
// \B - non word boundary
// ^ - início do alvo
// $ - fim do alvo

// Grupos
// (\w+) - grupo de word chars
// (\w+)? - grupo opcional
// (?:\w+) - non-capturing group

// Quantifier
// ? - zero ou uma vez.
// * - zero ou mais vezes.
// + - uma ou mais vezes.
// {n} - exatamente n vezes.
// {n,} - no mínimo n vezes.
// {n,m} - no mínimo n vezes, no máximo m vezes.

//Classes de char - []
// [A-Z] - letras de A até Z
// [123] - 1, 2 ou 3
// \d - todos os dígitos [0-9]
// \w - wordchar [A-Za-z0-9_]

// \s whitespace [\t\r\n\f]
// \t é um tab.
// \r é carriage return.
// \n é newline.
// \f é form feed.

// Regex email: ^([\w-]\.?)+@([\w-]+\.)+([A-Za-z]{2,4})+$

// a regex usa âncoras no início ^ e fim $ para garantir o match inteiro;

// antes do @, temos: ^([\w-]\.?)+
//  - definimos uma classe com word-chars e hífen, seguido por um ponto opcional: [\w-]\.?
//  - essa classe pode se repetir uma ou mais vezes, então criamos um grupo e + ao final: ([\w-]\.?)+

// depois do @, temos:
//  - ([\w-]+\.)+, que é bastante parecido com o anterior ao @, porém com o . obrigatório,
// - ([A-Za-z]{2,4})+$, que é o final da nossa regex, seleciona o domínio do email, como br, com, us. O mínimo de letras dessa parte final devem ser 2 e no máximo 4.

// A autenticidade de um email só pode ser verificada enviando um email para usuário.
