import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Heading,
  Hr,
  Link,
  Button,
} from '@react-email/components';
import { format } from 'date-fns';

interface BookingConfirmationEmailProps {
  guestName: string;
  guestEmail: string;
  villaName: string;
  villaImage: string;
  villaLocation: string;
  villaSlug: string;
  bookingId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  baseTotal: number;
  discount?: number;
  discountLabel?: string;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  currency: string;
  specialRequests?: string;
}

export default function BookingConfirmationEmail({
  guestName,
  guestEmail,
  villaName,
  villaImage,
  villaLocation,
  villaSlug,
  bookingId,
  checkInDate,
  checkOutDate,
  nights,
  guests,
  baseTotal,
  discount = 0,
  discountLabel,
  serviceFee,
  taxes,
  totalPrice,
  currency,
  specialRequests,
}: BookingConfirmationEmailProps) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.headerTitle}>🎉 Booking Confirmed!</Heading>
            <Text style={styles.headerSubtitle}>
              Your luxury villa experience awaits
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={styles.section}>
            <Text style={styles.greeting}>Dear {guestName},</Text>
            <Text style={styles.text}>
              Thank you for choosing <strong>Exclusive Villa Samui</strong>! We're excited to
              confirm your reservation at <strong>{villaName}</strong>.
            </Text>
            <Text style={styles.text}>
              Your payment has been successfully processed and your booking is now confirmed.
            </Text>
          </Section>

          {/* Villa Image */}
          {villaImage && (
            <Section style={styles.section}>
              <Img
                src={villaImage}
                alt={villaName}
                width="600"
                style={styles.villaImage}
              />
            </Section>
          )}

          {/* Booking Details */}
          <Section style={styles.section}>
            <Heading style={styles.sectionTitle}>📋 Booking Details</Heading>
            <Hr style={styles.divider} />

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
                <Text style={styles.label}>Villa:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>{villaName}</Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Location:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>{villaLocation}</Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Check-in:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>
                  {format(checkIn, 'EEEE, MMMM d, yyyy')} <span style={styles.time}>after 2:00 PM</span>
                </Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Check-out:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>
                  {format(checkOut, 'EEEE, MMMM d, yyyy')} <span style={styles.time}>before 11:00 AM</span>
                </Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Duration:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>{nights} {nights === 1 ? 'night' : 'nights'}</Text>
              </Column>
            </Row>

            <Row style={styles.detailRow}>
              <Column>
                <Text style={styles.label}>Guests:</Text>
              </Column>
              <Column>
                <Text style={styles.value}>{guests} {guests === 1 ? 'person' : 'people'}</Text>
              </Column>
            </Row>

            {specialRequests && (
              <Row style={styles.detailRow}>
                <Column>
                  <Text style={styles.label}>Special Requests:</Text>
                </Column>
                <Column>
                  <Text style={styles.value}>{specialRequests}</Text>
                </Column>
              </Row>
            )}
          </Section>

          {/* Price Breakdown */}
          <Section style={styles.section}>
            <Heading style={styles.sectionTitle}>💰 Price Summary</Heading>
            <Hr style={styles.divider} />

            <Row style={styles.priceRow}>
              <Column>
                <Text style={styles.priceLabel}>
                  {nights} {nights === 1 ? 'night' : 'nights'} × {currency} {(baseTotal / nights).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                <Text style={styles.priceLabel}>Service Fee (5%)</Text>
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
          </Section>

          {/* Important Information */}
          <Section style={styles.section}>
            <Heading style={styles.sectionTitle}>ℹ️ Important Information</Heading>
            <Hr style={styles.divider} />

            <Text style={styles.text}>
              <strong>Check-in Instructions:</strong><br />
              Please arrive after 2:00 PM. Our team will greet you at the villa entrance.
              Photo ID and booking confirmation will be required.
            </Text>

            <Text style={styles.text}>
              <strong>Cancellation Policy:</strong><br />
              Free cancellation up to 14 days before check-in. Cancellations made within 14 days
              will incur a 50% charge. No-shows will be charged 100%.
            </Text>

            <Text style={styles.text}>
              <strong>Contact Us:</strong><br />
              Email: <Link href="mailto:booking@exclusive-villa-samui.com" style={styles.link}>
                booking@exclusive-villa-samui.com
              </Link><br />
              Phone: +66 (0) 77 123 456<br />
              WhatsApp: +66 (0) 81 234 5678
            </Text>
          </Section>

          {/* Call to Action */}
          <Section style={styles.section}>
            <Button
              href={`https://exclusive-villa-samui.com/bookings/${bookingId}`}
              style={styles.button}
            >
              View Booking Details
            </Button>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              We look forward to welcoming you to {villaName}!
            </Text>
            <Text style={styles.footerText}>
              Best regards,<br />
              <strong>The Exclusive Villa Samui Team</strong>
            </Text>
            <Hr style={styles.divider} />
            <Text style={styles.footerSmall}>
              This email was sent to {guestEmail} regarding booking #{bookingId}.<br />
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
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 24px',
    textAlign: 'center' as const,
    background: '#667eea',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  headerSubtitle: {
    color: '#e0e7ff',
    fontSize: '16px',
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
  greeting: {
    color: '#1a202c',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
  },
  text: {
    color: '#4a5568',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  villaImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    display: 'block',
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
  },
  time: {
    color: '#718096',
    fontSize: '13px',
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
  button: {
    backgroundColor: '#667eea',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '14px 24px',
    borderRadius: '6px',
    margin: '0 auto',
    width: 'fit-content',
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
