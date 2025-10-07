import { z } from "zod";

export const paymentOrderSchema = z.object({
  nr_op: z.string().min(1, { message: "Nr. OP este obligatoriu." }),
  iban_platitor: z.string().min(1, { message: "IBAN plătitor este obligatoriu." }),
  den_trezorerie: z.string().min(1, { message: "Trezoreria este obligatorie." }),
  cui_beneficiar: z.string().min(1, { message: "CUI beneficiar este obligatoriu." }),
  den_beneficiar: z.string().min(1, { message: "Denumire beneficiar este obligatorie." }),
  iban_beneficiar: z.string().min(1, { message: "IBAN beneficiar este obligatoriu." }),
  den_banca_trez: z.string().min(1, { message: "Banca/Trezoreria este obligatorie." }),
  suma_op: z.coerce.number().min(0.01, { message: "Suma trebuie să fie mai mare ca 0." }),
  explicatii: z.string().min(1, { message: "Explicațiile sunt obligatorii." }),
});

export const formSchema = z.object({
  // f1129 attributes
  d_rec: z.string().default("0"),
  suma_control: z.string().min(1, { message: "Suma de control este obligatorie." }),
  luna_r: z.string().min(1, { message: "Luna este obligatorie." }),
  an: z.string().min(4, { message: "Anul trebuie să aibă 4 cifre." }),
  data_document: z.date({
    required_error: "Data documentului este obligatorie.",
  }),
  nr_document: z.string().min(1, { message: "Numărul documentului este obligatoriu." }),
  nume_ip: z.string().min(1, { message: "Numele este obligatoriu." }),
  adresa_ip: z.string().min(1, { message: "Adresa este obligatorie." }),
  cui_ip: z.string().min(1, { message: "CUI este obligatoriu." }),
  tip_ent: z.string().min(1, { message: "Tip entitate este obligatoriu." }),
  cod_trez_pl: z.string().min(1, { message: "Cod trezorerie este obligatoriu." }),
  
  // rand_op elements
  rand_op: z.array(paymentOrderSchema).min(1, "Trebuie să existe cel puțin un ordin de plată."),
});

export type FormData = z.infer<typeof formSchema>;
