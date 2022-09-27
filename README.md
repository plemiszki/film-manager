### Film Manager

Film Manager is an app for managing the daily operations of a film distribution business. This includes taking bookings, shipping DVDs, sending invoices, and calculating quarterly royalty statements. It also exposes an API of public data for ingestion by the company website.

![full_app](./doc/full_app.png)

## Films

First and foremost, this an app for storing data about films. The film details page has multiple tabs:

#### General

A film's director, cast, countries, languages, length, release schedule, and other general information is displayed here.

![films_general](./doc/films_general.jpg)

#### Contract

Contract data is displayed here, including all licensed rights and revenue splits.

![films_contract](./doc/films_contract.jpg)

#### Synopses

Synopses of different lengths and types are displayed here.

![films_synopses](./doc/films_synopses.jpg)

#### Marketing

The marketing tab includes all of a film's awards and press quotes. It also displays the film's genres, topics, related films in the catalog, and links to digital retailers, trailers, and social media pages.

Also, from this tab you can set how you want the film displayed on your own website.

![films_marketing](./doc/films_marketing.jpg)

#### Bookings

The film's bookings, screening formats, and other technical information is displayed here.

![films_bookings](./doc/films_bookings.jpg)

#### DVDs

A film can be published on DVDs intended for different audiences. The DVD types for the film are displayed here.

![films_dvds](./doc/films_dvds.jpg)

#### Statements

The royalty statements for a film are displayed here. You can cross films belonging to the same licensor.

![films_statements](./doc/films_statements.jpg)

#### Sublicensing

Sometimes you may want to sublicense certain rights to a film to another company. Sublicensed rights are displayed here.

![films_sublicensing](./doc/films_sublicensing.jpg)

## Venues

The venue details page displays a venue's contact information and lists all of its bookings.

![venue](./doc/venue.jpg)

## Bookings

The booking details page displays information about a booking. On this page you can also record box office information and keep track of invoices and payments. The app will calculate the amount due based on the terms of the booking, the box office (if applicable), and payments received.

![booking](./doc/booking.jpg)

## Calendar

The calendar offers an easy way to see what films are being released across different outlets within a given month.

![calendar](./doc/calendar.jpg)

## DVD Purchase Orders

DVDs are added to purchase orders. When complete, an invoice is sent to the customer (unless the customer sells on consignment) and a shipping file is sent to the warehouse for fulfillment.

The app can import inventory reports from the warehouse to display accurate stock information.

![purchase_order](./doc/purchase_order.jpg)

## DVD Reports

The app offers two kinds of DVD reports. The first report displays monthly totals by customer.

![reports_vendors](./doc/reports_vendors.jpg)

The second report displays unit and revenue totals for each new title by customer.

![reports_titles](./doc/reports_titles.jpg)

## Invoices

The app generates and sends invoices for both DVDs and bookings. Invoices are stored and can be exported, edited, or resent if necessary.

![invoice](./doc/invoice.jpg)

## Merchandise

You may want to sell other items on your website in addition to DVDs.

![merchandise](./doc/merchandise.jpg)

## Royalty Statements

The app generates royalty statements every quarter. Revenue and expenses are imported from your accounting system. You can then review the statements.

![statements](./doc/statements.jpg)

Clicking `Error Check` will make sure all the revenue and expenses were imported to a revenue stream with a revenue percentage split set up, and also that no films have exceeded their expense cap.

![statements_errors](./doc/statements_errors.jpg)

Manual adjustments to statements can be made as needed.

When ready, clicking `Send All` will generate the statements with the specified due date and send them to the proper licensors.
