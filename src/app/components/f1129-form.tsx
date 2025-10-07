"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formSchema, type FormData, type paymentOrderSchema } from '@/app/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, PlusCircle, Trash2, CalendarIcon, RefreshCw } from 'lucide-react';
import { z } from 'zod';

type PaymentOrder = z.infer<typeof paymentOrderSchema>;

const opTypes: Record<string, Partial<PaymentOrder> & { label: string }> = {
  "contrib_munca": {
    label: "Contrib_Munca",
    iban_platitor: "RO68TREZ2915069XXX023911",
    den_trezorerie: "Trezorerie Municipiul Craiova",
    cui_beneficiar: "24372699",
    den_beneficiar: "BUGETUL DE STAT",
    iban_beneficiar: "RO55TREZ29120A470300XXXX",
    den_banca_trez: "Trezorerie Municipiul Craiova",
    explicatii: "Sume din contributia asiguratorie pentru munca in curs de distribuire",
  },
  "buget_asig": {
    label: "Buget_Asig_Sociale",
    iban_platitor: "RO68TREZ2915069XXX023911",
    den_trezorerie: "Trezorerie Municipiul Craiova",
    cui_beneficiar: "24372699",
    den_beneficiar: "BUGETUL DE STAT",
    iban_beneficiar: "RO23TREZ2915503XXXXXXXXX",
    den_banca_trez: "Trezorerie Municipiul Craiova",
    explicatii: "BUGETUL DE STAT BUGETELE ASIG SOC SI FD SPEC in curs de distribuir",
  },
  "tva_trim": {
    label: "TVA_Trimestrial",
    iban_platitor: "RO68TREZ2915069XXX023911",
    den_trezorerie: "Trezorerie Municipiul Craiova",
    cui_beneficiar: "24372699",
    den_beneficiar: "BUGETUL DE STAT",
    iban_beneficiar: "RO33TREZ29120A100101XTVA",
    den_banca_trez: "Trezorerie Municipiul Craiova",
    explicatii: "TVA decont trim",
  }
};

const defaultValues: FormData = {
  d_rec: "0",
  suma_control: "24372783",
  luna_r: "10",
  an: "2025",
  data_document: new Date(),
  nr_document: "0000000022",
  nume_ip: "SC MAXDESIGN SRL",
  adresa_ip: "Str Constantin Brancoveanu nr79 bl60A sc1 ap7",
  cui_ip: "24372699",
  tip_ent: "2",
  cod_trez_pl: "TREZ291",
  rand_op: [
    {
      nr_op: "22",
      iban_platitor: "RO68TREZ2915069XXX023911",
      den_trezorerie: "Trezorerie Municipiul Craiova",
      cui_beneficiar: "24372699",
      den_beneficiar: "BUGETUL DE STAT",
      iban_beneficiar: "RO55TREZ29120A470300XXXX",
      den_banca_trez: "Trezorerie Municipiul Craiova",
      suma_op: 84,
      explicatii: "Sume din contributia asiguratorie pentru munca in curs de distribuire",
    },
  ],
};

export function F1129Form() {
  const [xmlInput, setXmlInput] = useState('');
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'rand_op',
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [form]);
  
  const handleOpTypeChange = (value: string, index: number) => {
    const preset = opTypes[value];
    if (preset) {
      const currentField = fields[index];
      // Keep existing suma_op and nr_op
      const { suma_op, nr_op } = currentField;
      const updatedField = { ...currentField, ...preset, suma_op, nr_op };
      update(index, updatedField);
    }
  };


  const handleLoadXml = () => {
    try {
      if (typeof window === 'undefined') return;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlInput, "application/xml");
      
      const errorNode = xmlDoc.querySelector('parsererror');
      if (errorNode) {
        throw new Error('XML invalid.');
      }

      const f1129 = xmlDoc.getElementsByTagName("f1129")[0];
      if (!f1129) throw new Error('Tag-ul <f1129> nu a fost găsit.');

      const getAttr = (attr: string) => f1129.getAttribute(attr) || '';
      
      const randOps = Array.from(xmlDoc.getElementsByTagName("rand_op")).map(op => ({
        nr_op: op.getAttribute("nr_op") || '',
        iban_platitor: op.getAttribute("iban_platitor") || '',
        den_trezorerie: op.getAttribute("den_trezorerie") || '',
        cui_beneficiar: op.getAttribute("cui_beneficiar") || '',
        den_beneficiar: op.getAttribute("den_beneficiar") || '',
        iban_beneficiar: op.getAttribute("iban_beneficiar") || '',
        den_banca_trez: op.getAttribute("den_banca_trez") || '',
        suma_op: Number(op.getAttribute("suma_op") || 0),
        explicatii: op.getAttribute("explicatii") || '',
      }));
      
      const dataDocString = getAttr('data_document');
      const dateParts = dataDocString.split('.').map(part => parseInt(part, 10));
      const dataDocument = dateParts.length === 3 ? new Date(dateParts[2], dateParts[1] - 1, dateParts[0]) : new Date();

      form.reset({
        d_rec: getAttr('d_rec'),
        suma_control: getAttr('suma_control'),
        luna_r: getAttr('luna_r'),
        an: getAttr('an'),
        data_document: dataDocument,
        nr_document: getAttr('nr_document'),
        nume_ip: getAttr('nume_ip'),
        adresa_ip: getAttr('adresa_ip'),
        cui_ip: getAttr('cui_ip'),
        tip_ent: getAttr('tip_ent'),
        cod_trez_pl: getAttr('cod_trez_pl'),
        rand_op: randOps.length > 0 ? randOps : defaultValues.rand_op,
      });

      toast({
        title: "Succes!",
        description: "Datele din XML au fost încărcate în formular.",
      });
      return true;
    } catch (error) {
      console.error("XML Parsing Error:", error);
      toast({
        variant: "destructive",
        title: "Eroare la încărcare",
        description: error instanceof Error ? error.message : "Unkown error.",
      });
      return false;
    }
  };

  const getOpTypeKeyByIBAN = (iban: string) => {
    return Object.keys(opTypes).find(key => opTypes[key].iban_beneficiar === iban);
  };
  
  const onSubmit = (data: FormData) => {
    let filesGenerated = 0;
    data.rand_op.forEach((op, index) => {
      const total_opm = op.suma_op;
      const nr_inregistrari = 1;

      let randOpXml = `<rand_op nr_op="${op.nr_op}" iban_platitor="${op.iban_platitor}" den_trezorerie="${op.den_trezorerie}" cui_beneficiar="${op.cui_beneficiar}" den_beneficiar="${op.den_beneficiar}" iban_beneficiar="${op.iban_beneficiar}" den_banca_trez="${op.den_banca_trez}" suma_op="${op.suma_op}" explicatii="${op.explicatii}"/>`;

      const formattedDate = format(data.data_document, "dd.MM.yyyy");
      const sumaControl = data.cui_ip + String(total_opm).replace('.', '');
      
      const opTypeKey = getOpTypeKeyByIBAN(op.iban_beneficiar);
      const opTypeLabel = opTypeKey ? opTypes[opTypeKey].label : `OP_${index + 1}`;
      const uniqueId = Date.now();
      const fileName = `f1129_${opTypeLabel}_${uniqueId}.xml`;

      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<f1129 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="mfp:anaf:dgti:f1129:declaratie:v1" xsi:schemaLocation="mfp:anaf:dgti:f1129:declaratie:v1" versiune_pdf="A2.0.42" d_rec="${data.d_rec}" suma_control="${sumaControl}" total_opm="${total_opm}" nr_inregistrari="${nr_inregistrari}" luna_r="${data.luna_r}" an="${data.an}" data_document="${formattedDate}" nr_document="${data.nr_document}" nume_ip="${data.nume_ip}" adresa_ip="${data.adresa_ip}" cui_ip="${data.cui_ip}" tip_ent="${data.tip_ent}" cod_trez_pl="${data.cod_trez_pl}">
${randOpXml}
</f1129>`;

      try {
        const blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        filesGenerated++;
      } catch (error) {
        toast({
          variant: "destructive",
          title: `Eroare la generarea fișierului pentru OP #${index + 1}`,
          description: "Nu s-a putut genera fișierul XML.",
        });
      }
    });

    if (filesGenerated > 0) {
      toast({
        title: "XML-uri Generate!",
        description: `${filesGenerated} fișier(e) XML au fost descărcate cu succes.`,
      });
    }
  };
  
  if (!form.formState.isDirty && !form.formState.isSubmitted) {
    return null; // Don't render form until default values are set
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Date Generale Declarație</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FormField control={form.control} name="nume_ip" render={({ field }) => ( <FormItem> <FormLabel>Nume/Denumire</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="adresa_ip" render={({ field }) => ( <FormItem> <FormLabel>Adresă</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="cui_ip" render={({ field }) => ( <FormItem> <FormLabel>CUI</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="an" render={({ field }) => ( <FormItem> <FormLabel>An</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="luna_r" render={({ field }) => ( <FormItem> <FormLabel>Luna</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField
              control={form.control}
              name="data_document"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Document</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd.MM.yyyy")
                          ) : (
                            <span>Alege o dată</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                        }}
                        initialFocus
                        locale={ro}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="nr_document" render={({ field }) => ( <FormItem> <FormLabel>Număr Document</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="tip_ent" render={({ field }) => ( <FormItem> <FormLabel>Tip Entitate</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="cod_trez_pl" render={({ field }) => ( <FormItem> <FormLabel>Cod Trezorerie</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="suma_control" render={({ field }) => ( <FormItem> <FormLabel>Sumă Control</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h2 className="font-headline text-3xl font-bold tracking-tight">Ordine de Plată</h2>
          {fields.map((field, index) => (
            <Card key={field.id} className="relative shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Ordin de Plată #{index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <FormItem className="md:col-span-2 lg:col-span-3">
                    <FormLabel>Selectare tip OP</FormLabel>
                    <Select onValueChange={(value) => handleOpTypeChange(value, index)}
                        value={getOpTypeKeyByIBAN(form.watch(`rand_op.${index}.iban_beneficiar`))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați un tip de plată pentru a pre-completa câmpurile" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contrib_munca">Sume din contributia asiguratorie pentru munca</SelectItem>
                        <SelectItem value="buget_asig">BUGETUL DE STAT BUGETELE ASIG SOC SI FD SPEC</SelectItem>
                        <SelectItem value="tva_trim">TVA decont trim</SelectItem>
                      </SelectContent>
                    </Select>
                 </FormItem>
                 <FormField control={form.control} name={`rand_op.${index}.suma_op`} render={({ field }) => ( <FormItem> <FormLabel>Sumă</FormLabel> <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name={`rand_op.${index}.nr_op`} render={({ field }) => ( <FormItem> <FormLabel>Nr. OP</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name={`rand_op.${index}.iban_platitor`} render={({ field }) => ( <FormItem> <FormLabel>IBAN Plătitor</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name={`rand_op.${index}.den_trezorerie`} render={({ field }) => ( <FormItem> <FormLabel>Denumire Trezorerie</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name={`rand_op.${index}.cui_beneficiar`} render={({ field }) => ( <FormItem> <FormLabel>CUI Beneficiar</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name={`rand_op.${index}.den_beneficiar`} render={({ field }) => ( <FormItem> <FormLabel>Denumire Beneficiar</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name={`rand_op.${index}.iban_beneficiar`} render={({ field }) => ( <FormItem> <FormLabel>IBAN Beneficiar</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name={`rand_op.${index}.den_banca_trez`} render={({ field }) => ( <FormItem> <FormLabel>Denumire Bancă/Trezorerie</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 <FormField control={form.control} name={`rand_op.${index}.explicatii`} render={({ field }) => ( <FormItem className="md:col-span-2 lg:col-span-3"> <FormLabel>Explicații</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </CardContent>
              <CardFooter>
                 <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Șterge Ordinul #{index + 1}
                 </Button>
              </CardFooter>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
                const newOp = { ...defaultValues.rand_op[0] };
                Object.keys(newOp).forEach(key => {
                    const k = key as keyof PaymentOrder;
                    if (k !== 'suma_op') {
                       (newOp as any)[k] = '';
                    } else {
                        newOp.suma_op = 0;
                    }
                    if (k === 'nr_op') {
                        newOp.nr_op = String(fields.length + 22);
                    }
                });
                append(newOp);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Adaugă Ordin de Plată
          </Button>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Acțiuni rapide</CardTitle>
            <CardDescription>Importați, exportați sau actualizați datele formularului.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Încarcă din XML</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle className="font-headline">Importă date din XML</DialogTitle>
                  <DialogDescription>Copiați conținutul fișierului XML în câmpul de mai jos și apăsați 'Încarcă Date'.</DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="<f1129>...</f1129>"
                  className="min-h-[200px] font-mono text-xs"
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" onClick={() => { if(handleLoadXml()) setXmlInput('') }}>Încarcă Date</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90"><Download className="mr-2 h-4 w-4" /> Generează și Descarcă XML</Button>
            <Button asChild variant="secondary">
                <a href="https://static.anaf.ro/static/10/Anaf/Declaratii_R/1129.html" target="_blank" rel="noopener noreferrer">
                    <RefreshCw className="mr-2 h-4 w-4" /> Actualizare fișier OPME
                </a>
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
