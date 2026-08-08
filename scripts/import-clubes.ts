import * as XLSX from "xlsx";
import * as fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ucesipxemhrugmqwxtei.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Erro: Variável de ambiente SUPABASE_SERVICE_ROLE_KEY é obrigatória");
  console.error("Defina a variável antes de executar o script:");
  console.error("  export SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui");
  console.error("  npm run import:clubes");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importClubesFromExcel(filePath: string) {
  try {
    console.log("Lendo arquivo Excel:", filePath);

    // Ler o arquivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Encontrados ${jsonData.length} registros no arquivo`);
    console.log("Colunas encontradas:", Object.keys(jsonData[0] || {}));

    // Processar os dados
    const clubes = jsonData.map((row: any) => {
      return {
        nome: row["Nome"] || row["NOME"] || row["nome"] || "",
        sigla: row["Sigla"] || row["SIGLA"] || row["sigla"] || null,
        logo_url: row["Logo"] || row["LOGO"] || row["logo_url"] || null,
        cidade: row["Cidade"] || row["CIDADE"] || row["cidade"] || null,
        estado: row["Estado"] || row["ESTADO"] || row["estado"] || null,
        fundacao: row["Fundação"] || row["FUNDAÇÃO"] || row["fundacao"] ? new Date(row["Fundação"] || row["FUNDAÇÃO"] || row["fundacao"]).toISOString().split("T")[0] : null,
        email: row["Email"] || row["EMAIL"] || row["email"] || null,
        telefone: row["Telefone"] || row["TELEFONE"] || row["telefone"] || null,
        site_url: row["Site"] || row["SITE"] || row["site_url"] || null,
        endereco: row["Endereço"] || row["ENDEREÇO"] || row["endereco"] || null,
        ordem: 0,
        ativo: true,
      };
    });

    // Filtrar clubes sem nome
    const clubesValidos = clubes.filter((clube) => clube.nome);

    console.log(`Clubes válidos encontrados: ${clubesValidos.length}`);

    // Mostrar exemplos de dados
    if (clubesValidos.length > 0) {
      console.log("\nExemplo de dados a serem importados:");
      console.log(JSON.stringify(clubesValidos[0], null, 2));
    }

    // Inserir no Supabase
    console.log("\nInserindo clubes no Supabase...");

    for (const clube of clubesValidos) {
      const { error } = await supabase.from("clubes").insert(clube);
      if (error) {
        console.error(`Erro ao inserir clube "${clube.nome}":`, error.message);
      } else {
        console.log(`✅ Clube "${clube.nome}" inserido com sucesso`);
      }
    }

    console.log("\nImportação concluída!");
  } catch (error) {
    console.error("Erro durante a importação:", error);
    process.exit(1);
  }
}

// Executar a importação
const excelPath = "/Users/marcosmonteirodacruz/Downloads/SGE - Sistema de Gestão Esportiva - CBDA.xlsx";
importClubesFromExcel(excelPath);
