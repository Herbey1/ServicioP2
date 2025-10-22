#!/usr/bin/env node
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

dotenv.config();
const prisma = new PrismaClient();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'SGCA';
const FROM_EMAIL = process.env.EMAIL_FROM || 'no-reply@example.com';

async function sendEmailViaSMTP(to, subject, body) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : undefined,
    secure: SMTP_PORT && Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  const res = await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    text: body,
  });
  return res;
}

async function processQueueOnce() {
  console.log('[EMAIL-WORKER] Buscando mensajes en email_queue...');
  const items = await prisma.email_queue.findMany({ where: { sent_at: null }, orderBy: { scheduled_at: 'asc' }, take: 20 });
  if (!items.length) {
    console.log('[EMAIL-WORKER] No hay mensajes pendientes.');
    return;
  }

  for (const item of items) {
    try {
      console.log(`[EMAIL-WORKER] Procesando id=${item.id} to=${item.to_email}`);

      // Para pruebas de desarrollo: si no hay credenciales SMTP, escribimos el contenido en logs
      if (!SMTP_HOST || !SMTP_USER) {
        console.log('--- EMAIL (dev-mode) ---');
        console.log('To:', item.to_email);
        console.log('Subject:', item.subject);
        console.log('Body:\n', item.body);
        console.log('--- END EMAIL ---');
        await prisma.email_queue.update({ where: { id: item.id }, data: { sent_at: new Date(), attempts: item.attempts + 1 } });
        continue;
      }

      const info = await sendEmailViaSMTP(item.to_email, item.subject, item.body);
      console.log('[EMAIL-WORKER] Enviado OK:', info.messageId || info);
      await prisma.email_queue.update({ where: { id: item.id }, data: { sent_at: new Date(), attempts: item.attempts + 1 } });
    } catch (err) {
      console.error('[EMAIL-WORKER] Error enviando email id=', item.id, err.message || err);
      await prisma.email_queue.update({ where: { id: item.id }, data: { attempts: item.attempts + 1, last_error: String(err.message || err) } });
    }
  }
}

async function main() {
  try {
    // loop simple: procesar cada X segundos
    const interval = Number(process.env.EMAIL_WORKER_INTERVAL_SECONDS || 15);
    console.log(`[EMAIL-WORKER] Iniciando (interval=${interval}s).`);
    while (true) {
      await processQueueOnce();
      await new Promise((r) => setTimeout(r, interval * 1000));
    }
  } catch (e) {
    console.error('[EMAIL-WORKER] Error fatal', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
