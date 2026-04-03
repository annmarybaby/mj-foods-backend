// ═══════════════════════════════════════════════════════════════════
//  MJ FOODS ENTERPRISES — STABLE PDF INVOICE UTILITY (V4.2)
// ═══════════════════════════════════════════════════════════════════

function buildInvoiceMarkup(sale) {
    const shop = sale.shop || "Walk-in Customer";
    const phone = sale.phone || localStorage.getItem('mj_billing_draft_phone') || '';
    const total = window.formatCurrency(sale.total);
    const dateObj = new Date(sale.timestamp || Date.now());
    const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const invoiceId = sale.id ? `MJ-${dateObj.getFullYear()}-${sale.id}` : `MJ-${dateObj.getFullYear()}-${sale.timestamp}`;

    const itemsHtml = sale.items.map(item => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 18px 0; font-size: 14px; font-weight: 500; color: #1a202c;">${item.name}</td>
            <td style="padding: 18px 0; text-align: center; font-size: 14px; color: #4a5568;">${item.qty}</td>
            <td style="padding: 18px 0; text-align: right; font-size: 14px; color: #4a5568;">${window.formatCurrency(item.price)}</td>
            <td style="padding: 18px 0; text-align: right; font-weight: 700; font-size: 15px; color: #000;">${window.formatCurrency(item.total)}</td>
        </tr>`).join('');

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #3b82f6; padding-bottom: 30px; margin-bottom: 40px;">
            <div style="display: flex; align-items: center; gap: 25px;">
                <img src="assets/logo.jpeg" style="width: 100px; height: 100px; border-radius: 20px; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=MJ+Enterprises&background=3b82f6&color=fff&bold=true'">
                <div>
                    <h1 style="margin: 0; font-size: 38px; font-weight: 800; color: #3b82f6; letter-spacing: -1.5px;">M J ENTERPRISES</h1>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 15px; font-weight: 600;">Quality Bakery & Catering Services</p>
                    <p style="margin: 2px 0; color: #1e293b; font-size: 12px; font-weight: 700;">FSSAI: 21323180000729</p>
                </div>
            </div>
            <div style="text-align: right;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: #000; text-transform: uppercase;">Tax Invoice</h2>
                <p style="margin: 5px 0; color: #3b82f6; font-weight: 700;">No: ${invoiceId}</p>
                <p style="margin: 0; color: #64748b; font-size: 14px;">${dateStr} | ${timeStr}</p>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; background: #f8fafc; padding: 30px; border-radius: 25px; border: 1px solid #e2e8f0;">
            <div>
                <span style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 10px;">Billed To:</span>
                <div style="font-size: 20px; font-weight: 800; color: #1e293b;">${shop}</div>
                <div style="font-size: 14px; color: #64748b; margin-top: 5px;">${phone || 'Verified Customer Account'}</div>
                <div style="margin-top: 18px; display:grid; gap:8px;">
                    <div style="display:flex; justify-content:space-between; gap:20px; font-size:13px;">
                        <span style="color:#64748b; font-weight:700;">Client Name</span>
                        <span style="color:#0f172a; font-weight:800;">${shop}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; gap:20px; font-size:13px;">
                        <span style="color:#64748b; font-weight:700;">Invoice Date</span>
                        <span style="color:#0f172a; font-weight:800;">${dateStr}</span>
                    </div>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 10px;">Facility Location:</span>
                <div style="font-size: 15px; font-weight: 700; color: #1e293b;">MJ Foods Hub - Main Unit</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">19/241 Kavaraparambu, Airport Road, Angamaly-683572</div>
                <div style="font-size: 13px; color: #64748b;">Contact: +91 9495691397, +91 8282821201</div>
            </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
                <tr style="border-bottom: 3px solid #000; border-top: 1px solid #e2e8f0;">
                    <th style="padding: 15px 0; text-align: left; font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase;">Product Detail</th>
                    <th style="padding: 15px 0; text-align: center; font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase;">Qty</th>
                    <th style="padding: 15px 0; text-align: right; font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase;">Price</th>
                    <th style="padding: 15px 0; text-align: right; font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase;">Amount</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="width: 320px; background: #3b82f6; color: white; padding: 30px; border-radius: 25px; box-shadow: 0 15px 35px rgba(59, 130, 246, 0.25);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 15px; font-weight: 600; opacity: 0.9;">Subtotal</span>
                    <span style="font-size: 18px; font-weight: 700;">${total}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 15px;">
                    <span style="font-size: 18px; font-weight: 800;">GRAND TOTAL</span>
                    <span style="font-size: 28px; font-weight: 900; color: #fff;">${total}</span>
                </div>
            </div>
        </div>

        <div style="margin-top: 80px; text-align: center; border-top: 2px solid #f1f5f9; padding-top: 40px;">
            <div style="display: inline-block; padding: 10px 40px; background: #f0fdf4; border: 1.5px dashed #22c55e; border-radius: 40px; color: #166534; font-weight: 800; font-size: 15px; margin-bottom: 20px;">
                Computer Generated Official Invoice
            </div>
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1e293b;">Thank you for your business / നന്ദി!</p>
            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 500;">Valid without physical signature.</p>
        </div>
    `;
}

function sanitizePdfText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

async function loadImageAsDataUrl(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.92));
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = reject;
        img.src = src;
    });
}

async function createInvoicePdf(sale) {
    const jsPDFCtor = window.jspdf?.jsPDF || window.jsPDF;
    if (!jsPDFCtor) throw new Error('jsPDF library not available');

    const doc = new jsPDFCtor({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 18;

    const shop = sanitizePdfText(sale.shop || 'Walk-in Customer');
    const phone = sanitizePdfText(sale.phone || localStorage.getItem('mj_billing_draft_phone') || '');
    const dateObj = new Date(sale.timestamp || Date.now());
    const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const invoiceId = sale.id ? `MJ-${dateObj.getFullYear()}-${sale.id}` : `MJ-${dateObj.getFullYear()}-${sale.timestamp}`;
    const items = Array.isArray(sale.items) ? sale.items : [];
    const grandTotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

    try {
        const logoData = await loadImageAsDataUrl('assets/logo.jpeg');
        doc.addImage(logoData, 'JPEG', margin, y - 4, 22, 22);
    } catch (e) {
        // Keep PDF generation working even if the logo cannot be loaded.
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(35, 99, 235);
    doc.setFontSize(20);
    doc.text('MJ FOODS ENTERPRISES', margin + 28, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9.5);
    doc.text('Quality Bakery & Catering Services', margin + 28, y + 10);
    doc.text('FSSAI: 21323180000729', margin + 28, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text('TAX INVOICE', pageWidth - margin, y + 4, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoiceId}`, pageWidth - margin, y + 10, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`${dateStr} | ${timeStr}`, pageWidth - margin, y + 15, { align: 'right' });

    y += 28;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 10;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('BILLED TO', margin + 4, y + 6);
    doc.text('COMPANY DETAILS', pageWidth / 2 + 6, y + 6);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(shop, margin + 4, y + 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(phone || 'Phone not saved', margin + 4, y + 19);
    doc.text(`Invoice Date: ${dateStr}`, margin + 4, y + 24);

    doc.text('MJ Foods Hub - Main Unit', pageWidth / 2 + 6, y + 13);
    doc.text('19/241 Kavaraparambu, Airport Road', pageWidth / 2 + 6, y + 19);
    doc.text('Angamaly-683572 | +91 9495691397', pageWidth / 2 + 6, y + 24);

    y += 38;

    const colX = {
        item: margin,
        qty: pageWidth - 76,
        price: pageWidth - 52,
        amount: pageWidth - margin
    };

    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y, pageWidth - margin * 2, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Item', colX.item + 3, y + 6);
    doc.text('Qty', colX.qty, y + 6, { align: 'center' });
    doc.text('Price', colX.price, y + 6, { align: 'right' });
    doc.text('Amount', colX.amount - 3, y + 6, { align: 'right' });

    y += 12;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);

    items.forEach((item, index) => {
        if (y > pageHeight - 28) {
            doc.addPage();
            y = 18;
        }

        const rowName = sanitizePdfText(item.name);
        const wrappedName = doc.splitTextToSize(rowName, pageWidth - 90);
        const rowHeight = Math.max(8, wrappedName.length * 4.5);

        if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y - 4, pageWidth - margin * 2, rowHeight + 3, 'F');
        }

        doc.text(wrappedName, colX.item + 3, y);
        doc.text(String(item.qty || 0), colX.qty, y, { align: 'center' });
        doc.text(window.formatCurrency(item.price || 0), colX.price, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(window.formatCurrency(item.total || 0), colX.amount - 3, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');

        y += rowHeight + 2;
    });

    y += 6;
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(pageWidth - 74, y, 60, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Grand Total', pageWidth - 44, y + 7, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(window.formatCurrency(grandTotal), pageWidth - 44, y + 15, { align: 'center' });

    return doc;
}

window.generateInvoicePDF = async (sale) => {
    if (!sale || !sale.items || sale.items.length === 0) {
        return alert("No data to generate PDF!");
    }

    const shop = sale.shop || "Customer";

    try {
        const doc = await createInvoicePdf(sale);
        doc.save(`Invoice_${shop.replace(/ /g, '_')}.pdf`);
        console.log("✅ PDF Generated Successfully");
    } catch (e) {
        console.error("PDF Engine Error:", e);
        alert("⚠️ Invoice drawing failed. Try again.");
    }
};

window.printInvoiceDocument = (sale) => {
    if (!sale || !sale.items || sale.items.length === 0) {
        return alert("No data to print!");
    }

    const printWindow = window.open('', '_blank', 'width=980,height=1200');
    if (!printWindow) {
        return alert('Please allow pop-ups to print the invoice.');
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice Print</title>
            <meta charset="utf-8">
            <style>
                body { margin: 0; padding: 24px; background: #ffffff; font-family: Arial, sans-serif; }
                @media print {
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            ${buildInvoiceMarkup(sale)}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
};

window.shareInvoiceWhatsApp = async (sale) => {
    // Generate PDF First
    await window.generateInvoicePDF(sale);

    // Prepare Link
    const shop = sale.shop || "Customer";
    const phone = localStorage.getItem('mj_billing_draft_phone') || '';
    const cleanPhone = phone.replace(/\D/g, '');
    let finalPhone = cleanPhone;
    if (finalPhone && finalPhone.length === 10) finalPhone = '91' + finalPhone;

    const message = `*MJ FOODS ENTERPRISES*%0AHello _${shop}_, your invoice is ready for download.%0A━━━━━━━━━━━━━━━━━━%0A_Generated via MJ Foods CRM_`;
    const url = `https://wa.me/${finalPhone}?text=${message}`;

    alert("✅ PDF Ready!\nShared to WhatsApp now.");
    window.open(url, '_blank');
};
