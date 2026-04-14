import {
  CLIENT_TYPE_COMPANY_VALUE,
  CLIENT_TYPE_INDIVIDUAL_VALUE,
} from "../constants";
import { normalizeClientDocument } from "./normalization";

function isRepeatedDigits(value: string) {
  return /^(\d)\1+$/.test(value);
}

export function isValidCpf(value: string) {
  const cpf = normalizeClientDocument(value);

  if (cpf.length !== 11 || isRepeatedDigits(cpf)) {
    return false;
  }

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(cpf[index]) * (10 - index);
  }

  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(cpf[9])) {
    return false;
  }

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(cpf[index]) * (11 - index);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;

  return remainder === Number(cpf[10]);
}

export function isValidCnpj(value: string) {
  const cnpj = normalizeClientDocument(value);

  if (cnpj.length !== 14 || isRepeatedDigits(cnpj)) {
    return false;
  }

  const calculateDigit = (base: string, factors: number[]) => {
    const total = base
      .split("")
      .reduce(
        (sum, char, index) => sum + Number(char) * (factors[index] ?? 0),
        0,
      );
    const remainder = total % 11;

    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(
    cnpj.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  if (firstDigit !== Number(cnpj[12])) {
    return false;
  }

  const secondDigit = calculateDigit(
    cnpj.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return secondDigit === Number(cnpj[13]);
}

export function getClientDocumentValidationMessage(
  typeValue: string,
  value: string,
) {
  const document = normalizeClientDocument(value);

  if (!document) {
    return "Documento é obrigatório";
  }

  if (typeValue === CLIENT_TYPE_INDIVIDUAL_VALUE) {
    return isValidCpf(document) ? null : "CPF inválido";
  }

  if (typeValue === CLIENT_TYPE_COMPANY_VALUE) {
    return isValidCnpj(document) ? null : "CNPJ inválido";
  }

  return "Tipo de cliente inválido";
}
