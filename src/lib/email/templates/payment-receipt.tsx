import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Heading,
  Hr,
  Link,
} from '@react-email/components';
import { format } from 'date-fns';

interface PaymentReceiptEmailProps {
  guestName: string;
  guestEmail: string;
  villaName: string;
  bookingId: string;
  transactionId: string;
  paymentDate: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  baseTotal: number;
  discount?: number;
  discountLabel?: string;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  currency: string;
  paymentMethod: string;
}

export default function PaymentReceiptEmail({
  guestName,
  guestEmail,
  villaName,
  bookingId,
  transactionId,
  paymentDate,
  checkInDate,
  checkOutDate,
  nights,
  baseTotal,
  discount = 0,
  discountLabel,
  serviceFee,
  taxes,
  totalPrice,
  currency,
  paymentMethod = 'Credit Card',
}: PaymentReceiptEmailProps) {
  const paid = new Date(paymentDate);
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.headerTitle}>💳 Payment Receipt</Heading>
            <Text style={styles.headerSubtitle}>
              Official payment confirmation
            </Text>
          </Section>

          {/* Receipt Notice */}
          <Section style={styles.notice}>
            <Text style={styles.noticeText}>
              ✅ Your payment has been successfully processed
            </Text>
          </Section>

          {/* Receipt Information */}
          <Section style={styles.section}>
            <Heading style={styles.sectionTitle}>📄 Receipt Details</Heading>
            <Hr style={styles.divider} />

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Receipt Number:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>{transactionId}</Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Booking ID:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>{bookingId}</Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Payment Date:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>
                  {format(paid, 'MMMM d, yyyy')} at {format(paid, 'h:mm a')}
                </Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Payment Method:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>{paymentMethod}</Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Bill To:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>
                  {guestName}<br />
                  {guestEmail}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Booking Details */}
          <Section style={styles.section}>
            <Heading style={styles.sectionTitle}>🏠 Booking Information</Heading>
            <Hr style={styles.divider} />

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Property:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>{villaName}</Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Check-in:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>
                  {format(checkIn, 'EEEE, MMMM d, yyyy')}
                </Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Check-out:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>
                  {format(checkOut, 'EEEE, MMMM d, yyyy')}
                </Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Duration:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Payment Breakdown */}
          <Section style={styles.section}>
            <Heading style={styles.sectionTitle}>💰 Payment Breakdown</Heading>
            <Hr style={styles.divider} />

            <Row style={styles.priceRow}>
              <Column>
                <Text style={styles.priceLabel}>
                  Accommodation ({nights} {nights === 1 ? 'night' : 'nights'})
                </Text>
              </Column>
              <Column align="right">
                <Text style={styles.priceValue}>
                  {currency} {baseTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </Column>
            </Row>

            {discount > 0 && (
              <Row style={styles.priceRow}>
                <Column>
                  <Text style={styles.discountLabel}>
                    {discountLabel || 'Discount'}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={styles.discountValue}>
                    - {currency} {discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </Column>
              </Row>
            )}

            <Row style={styles.priceRow}>
              <Column>
                <Text style={styles.priceLabel}>Service Fee</Text>
              </Column>
              <Column align="right">
                <Text style={styles.priceValue}>
                  {currency} {serviceFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </Column>
            </Row>

            <Row style={styles.priceRow}>
              <Column>
                <Text style={styles.priceLabel}>VAT (7%)</Text>
              </Column>
              <Column align="right">
                <Text style={styles.priceValue}>
                  {currency} {taxes.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </Column>
            </Row>

            <Hr style={styles.divider} />

            <Row style={styles.totalRow}>
              <Column>
                <Text style={styles.totalLabel}>Total Paid</Text>
              </Column>
              <Column align="right">
                <Text style={styles.totalValue}>
                  {currency} {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </Column>
            </Row>

            <Section style={styles.paidStamp}>
              <Text style={styles.paidStampText}>✓ PAID IN FULL</Text>
            </Section>
          </Section>

          {/* Refund Policy */}
          <Section style={styles.section}>
            <Heading style={styles.sectionTitle}>🔄 Refund Policy</Heading>
            <Hr style={styles.divider} />

            <Text style={styles.text}>
              • Free cancellation up to 14 days before check-in<br />
              • 50% refund for cancellations within 7-14 days<br />
              • No refund for cancellations within 7 days<br />
              • Refunds take 5-10 business days to process
            </Text>
          </Section>

          {/* Support */}
          <Section style={styles.section}>
            <Text style={styles.text}>
              <strong>Questions about your receipt?</strong><br />
              Contact us at{' '}
              <Link href="mailto:billing@exclusive-villa-samui.com" style={styles.link}>
                billing@exclusive-villa-samui.com
              </Link>
              {' '}or call +66 (0) 77 123 456
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This is an official receipt from Exclusive Villa Samui.
            </Text>
            <Text style={styles.footerText}>
              <strong>Exclusive Villa Samui Co., Ltd.</strong><br />
              123 Beach Road, Chaweng, Koh Samui<br />
              Surat Thani 84320, Thailand<br />
              Tax ID: 0123456789012
            </Text>
            <Hr style={styles.divider} />
            <Text style={styles.footerSmall}>
              This receipt was sent to {guestEmail}.<br />
              Transaction ID: {transactionId}<br />
              © 2025 Exclusive Villa Samui. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '0',
    maxWidth: '600px',
    border: '1px solid #e0e0e0',
  },
  header: {
    backgroundColor: '#2d3748',
    padding: '40px 24px',
    textAlign: 'center' as const,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  headerSubtitle: {
    color: '#cbd5e0',
    fontSize: '16px',
    margin: '0',
  },
  notice: {
    backgroundColor: '#d4edda',
    padding: '16px 24px',
    borderLeft: '4px solid #28a745',
  },
  noticeText: {
    color: '#155724',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0',
  },
  section: {
    padding: '24px',
  },
  sectionTitle: {
    color: '#1a202c',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
  },
  text: {
    color: '#4a5568',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 16px 0',
  },
  divider: {
    borderColor: '#e2e8f0',
    margin: '16px 0',
  },
  detailRow: {
    marginBottom: '12px',
  },
  label: {
    color: '#718096',
    fontSize: '14px',
    margin: '0',
    fontWeight: '500',
  },
  value: {
    color: '#1a202c',
    fontSize: '14px',
    margin: '0',
    fontWeight: '400',
    textAlign: 'right' as const,
  },
  priceRow: {
    marginBottom: '8px',
  },
  priceLabel: {
    color: '#4a5568',
    fontSize: '14px',
    margin: '0',
  },
  priceValue: {
    color: '#1a202c',
    fontSize: '14px',
    margin: '0',
  },
  discountLabel: {
    color: '#38a169',
    fontSize: '14px',
    margin: '0',
    fontWeight: '500',
  },
  discountValue: {
    color: '#38a169',
    fontSize: '14px',
    margin: '0',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: '16px',
    backgroundColor: '#f7fafc',
    padding: '12px',
  },
  totalLabel: {
    color: '#1a202c',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0',
  },
  totalValue: {
    color: '#1a202c',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0',
  },
  paidStamp: {
    textAlign: 'center' as const,
    marginTop: '24px',
  },
  paidStampText: {
    color: '#38a169',
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    border: '3px solid #38a169',
    padding: '12px 24px',
    display: 'inline-block',
    borderRadius: '4px',
  },
  link: {
    color: '#667eea',
    textDecoration: 'underline',
  },
  footer: {
    padding: '24px',
    backgroundColor: '#f7fafc',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#4a5568',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 12px 0',
  },
  footerSmall: {
    color: '#a0aec0',
    fontSize: '12px',
    lineHeight: '18px',
    margin: '0',
  },
};
