package com.example.demo.service;

import com.example.demo.entity.Donation;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.net.URL;

@Service
public class PDFCertificateService {

    public byte[] createPDF(Donation donation) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(document, out);

            // Add a Page Event for the Watermark
            writer.setPageEvent(new WatermarkEvent());

            document.open();

            // 1. Add Logo
            try {
                URL logoUrl = getClass().getResource("/static/charityapplogo.png"); // Make sure file is in resources
                if (logoUrl != null) {
                    Image logo = Image.getInstance(logoUrl);
                    logo.scaleToFit(100, 100);
                    logo.setAlignment(Element.ALIGN_CENTER);
                    document.add(logo);
                }
            } catch (Exception e) {
                System.err.println("Logo not found, skipping...");
            }
            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, Font.BOLD, Color.CYAN);
            Paragraph appName = new Paragraph("ChainHeart", brandFont);
            appName.setAlignment(Element.ALIGN_CENTER);
            document.add(appName);
            // 2. Styled Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, Font.BOLD);
            Paragraph title = new Paragraph("CERTIFICATE OF DONATION", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(20);
            document.add(title);

            // 3. Horizontal Line (Border Effect)
            Paragraph line = new Paragraph("____________________________________________________");
            line.setAlignment(Element.ALIGN_CENTER);
            document.add(line);
            document.add(new Paragraph("\n"));

            // 4. Content Body
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Paragraph p1 = new Paragraph("This is to officially certify that", bodyFont);
            p1.setAlignment(Element.ALIGN_CENTER);
            document.add(p1);

            Font amountFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph amount = new Paragraph(donation.getAmount() + " ETH", amountFont);
            amount.setAlignment(Element.ALIGN_CENTER);
            document.add(amount);

            Paragraph p2 = new Paragraph("was donated to " + donation.getCharityName() + " for the campaign:", bodyFont);
            p2.setAlignment(Element.ALIGN_CENTER);
            document.add(p2);

            Font campaignFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 14);
            Paragraph campaign = new Paragraph("\"" + (donation.getCampaignTitle() != null ? donation.getCampaignTitle() : "General Support") + "\"", campaignFont);
            campaign.setAlignment(Element.ALIGN_CENTER);
            document.add(campaign);

            // 5. Blockchain Meta Data Table
            document.add(new Paragraph("\n\n"));
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.addCell(getCell("Transaction Hash:", PdfPCell.ALIGN_LEFT));
            table.addCell(getCell(donation.getTxHash(), PdfPCell.ALIGN_RIGHT));
            table.addCell(getCell("Date:", PdfPCell.ALIGN_LEFT));
            table.addCell(getCell(donation.getTimestamp().toString(), PdfPCell.ALIGN_RIGHT));
            document.add(table);

            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            document.add(new Paragraph("Blockchain Verification:", labelFont));

            // Create the clickable link
            String etherscanUrl = "https://sepolia.etherscan.io/tx/" + donation.getTxHash();

            // Styled Link (Blue and Underlined)
            Font linkFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.UNDERLINE, java.awt.Color.BLUE);
            Anchor anchor = new Anchor(donation.getTxHash(), linkFont);
            anchor.setReference(etherscanUrl);

            Paragraph txParagraph = new Paragraph();
            txParagraph.add(anchor);
            document.add(txParagraph);

            document.add(new Paragraph("\n[Verified on Blockchain] "));

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate styled PDF", e);
        }
    }

    // Helper method for table cells
    private PdfPCell getCell(String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 10)));
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        cell.setBorder(PdfPCell.NO_BORDER);
        return cell;
    }

    // Inner class to handle the Watermark
    static class WatermarkEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte canvas = writer.getDirectContentUnder();
            Phrase watermark = new Phrase("VERIFIED ON BLOCKCHAIN", FontFactory.getFont(FontFactory.HELVETICA, 40, Font.BOLD, GrayColor.GRAYWHITE));
            ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER, watermark, 297, 421, 45); // Centered at 45 degrees
        }
    }
}