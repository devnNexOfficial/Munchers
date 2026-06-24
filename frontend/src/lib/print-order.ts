'use client';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { KDSOrder } from '../app/(restaurant)/kds/types';
import KOTTemplate from '../components/KOTTemplate';
import CustomerReceiptTemplate from '../components/CustomerReceiptTemplate';

export interface OrderForPrint extends KDSOrder {}

export interface PrintSettings {
  printer_enabled: boolean;
  print_copies: number;
}

export function printOrderDocuments(order: KDSOrder, settings: PrintSettings): void {
  // 1. Silent no-op if printer is disabled
  if (!settings.printer_enabled) {
    return;
  }

  // 2. Prepare HTML templates using renderToString
  const kotHtml = renderToString(React.createElement(KOTTemplate, { order }));
  let customerReceiptHtml = '';

  if (settings.print_copies >= 2) {
    customerReceiptHtml = renderToString(React.createElement(CustomerReceiptTemplate, { order }));
  }

  // 3. Create a temporary print container
  const printContainerId = 'print-mount-root';
  let printContainer = document.getElementById(printContainerId);
  if (printContainer) {
    printContainer.remove();
  }

  printContainer = document.createElement('div');
  printContainer.id = printContainerId;
  
  // Set inline styles to keep it hidden in normal screen view
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-9999px';
  printContainer.style.top = '-9999px';

  // 4. Inject styles and content
  // We use page-break-after/break-after to split pages for KOT and Receipt in a single print job.
  const styleHtml = `
    <style>
      @media screen {
        #${printContainerId} {
          display: none !important;
        }
      }
      @media print {
        /* Hide everything on screen */
        body > *:not(#${printContainerId}) {
          display: none !important;
        }
        html, body {
          background-color: #fff !important;
          color: #000 !important;
          width: 80mm !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #${printContainerId} {
          display: block !important;
          position: static !important;
          width: 80mm !important;
          margin: 0 auto !important;
          padding: 0 !important;
        }
        .print-page {
          width: 80mm !important;
          box-sizing: border-box !important;
        }
        .page-break {
          page-break-after: always !important;
          break-after: page !important;
        }
        @page {
          size: auto;
          margin: 0mm;
        }
      }
    </style>
  `;

  let contentHtml = '';
  if (customerReceiptHtml) {
    contentHtml = `
      <div class="print-page page-break">${kotHtml}</div>
      <div class="print-page">${customerReceiptHtml}</div>
    `;
  } else {
    contentHtml = `
      <div class="print-page">${kotHtml}</div>
    `;
  }

  printContainer.innerHTML = styleHtml + contentHtml;
  document.body.appendChild(printContainer);

  // 5. Trigger native print dialog and cleanup
  try {
    window.print();
  } catch (e) {
    console.error('Print failed:', e);
  } finally {
    // Remove container after dialog is closed/canceled
    if (printContainer && printContainer.parentNode) {
      printContainer.parentNode.removeChild(printContainer);
    }
  }
}
