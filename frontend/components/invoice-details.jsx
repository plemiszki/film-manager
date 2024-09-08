import React from "react";
import {
  fetchEntity,
  Spinner,
  GrayedOut,
  Table,
  Button,
} from "handy-components";

export default class InvoiceDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      invoice: {},
      rows: [],
      payments: [],
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { invoice, rows, payments } = response;
      const mappedPayments = payments.map((payment) => {
        return {
          label:
            "Payment" +
            (payment.notes ? " - " + payment.notes : "") +
            " (" +
            payment.date +
            ")",
          totalPrice: payment.amount,
        };
      });
      this.setState({
        spinner: false,
        invoice,
        rows,
        payments: mappedPayments,
      });
    });
  }

  clickExport() {
    window.location.pathname = `api/invoices/${this.state.invoice.id}/export`;
  }

  render() {
    const { spinner } = this.props;
    const { invoice, rows, payments } = this.state;
    const { stripeId, invoiceType } = invoice;
    const dvdInvoice = invoiceType === "dvd";
    const bookingInvoice = invoiceType === "booking";

    const tableColumns = dvdInvoice
      ? [
          { name: "label", header: "Item" },
          { name: "price" },
          { name: "qty" },
          { name: "totalPrice" },
        ]
      : [
          { name: "label", header: "Description" },
          { name: "totalPrice", header: "Amount" },
        ];

    return (
      <>
        <div className="handy-component">
          <h1>Invoice Details</h1>
          <div className="white-box">
            <div className="row">
              <div className={bookingInvoice ? "col-xs-2" : "col-xs-4"}>
                <h2>Number</h2>
                {invoice.number}
              </div>
              <div className={bookingInvoice ? "col-xs-2" : "col-xs-4"}>
                <h2>Sent Date</h2>
                {invoice.sentDate}
              </div>
              {!bookingInvoice && (
                <div className="col-xs-4">
                  <h2>PO Number</h2>
                  {invoice.poNumber}
                </div>
              )}
              {bookingInvoice && (
                <div>
                  <div className="col-xs-4">
                    <h2>Film</h2>
                    {invoice.film}
                  </div>
                  <div className="col-xs-4">
                    <h2>Venue</h2>
                    {invoice.venue}
                  </div>
                </div>
              )}
            </div>
            <div className="row">
              <div className="col-xs-4">
                <h2>Billing Address</h2>
                <p>{invoice.billingName}</p>
                <p>{invoice.billingAddress1}</p>
                <p>{invoice.billingAddress2}</p>
                <p>
                  {invoice.billingCity}, {invoice.billingState}{" "}
                  {invoice.billingZip}
                </p>
                <p>
                  {invoice.billingCountry === "USA"
                    ? ""
                    : invoice.billingCountry}
                </p>
              </div>
              {invoice.shippingAddress1 && (
                <div className="col-xs-4">
                  <h2>Shipping Address</h2>
                  <p>{invoice.shippingName}</p>
                  <p>{invoice.shippingAddress1}</p>
                  <p>{invoice.shippingAddress2}</p>
                  <p>
                    {invoice.shippingCity}, {invoice.shippingState}{" "}
                    {invoice.shippingZip}
                  </p>
                  <p>
                    {invoice.shippingCountry === "USA"
                      ? ""
                      : invoice.shippingCountry}
                  </p>
                </div>
              )}
              {stripeId ? (
                <div className="col-xs-4">
                  <h2>Stripe ID</h2>
                  <a
                    href={`https://dashboard.stripe.com/invoices/${stripeId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                  >
                    {stripeId}
                  </a>
                </div>
              ) : null}
            </div>
            <hr />
            <Table
              columns={tableColumns}
              rows={rows.concat(payments)}
              sortable={false}
              links={false}
              marginBottom
            />
            <hr />
            <div className="row">
              <div className="col-xs-12">
                <h2>Total</h2>
                {invoice.total}
              </div>
            </div>
            {invoice.notes && (
              <div className="row">
                <div className="col-xs-12">
                  <h2>Notes</h2>
                  {invoice.notes.split("\n").map((line, key) => {
                    return (
                      <span key={key}>
                        {line}
                        <br />
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            <Button
              text="Export"
              disabled={spinner}
              onClick={() => {
                this.clickExport();
              }}
            />
            <Spinner visible={spinner} />
            <GrayedOut visible={spinner} />
          </div>
        </div>
        <style jsx>{`
          .row,
          table {
            margin-bottom: 30px;
          }
        `}</style>
      </>
    );
  }

  renderTableHeaders() {
    if (this.state.invoice.invoiceType === "dvd") {
      return (
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Total Price</th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      );
    }
  }

  renderTableColumns(row, index) {
    if (this.state.invoice.invoiceType === "dvd") {
      return (
        <tr key={index}>
          <td>
            <div className="link-padding">{row.label}</div>
          </td>
          <td>
            <div className="link-padding">{row.price}</div>
          </td>
          <td>
            <div className="link-padding">{row.qty}</div>
          </td>
          <td>
            <div className="link-padding">{row.totalPrice}</div>
          </td>
        </tr>
      );
    } else {
      return (
        <tr key={index}>
          <td className="indent">{row.label}</td>
          <td>{row.totalPrice}</td>
        </tr>
      );
    }
  }
}
