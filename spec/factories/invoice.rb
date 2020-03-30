FactoryBot.define do

  factory :invoice do
    sent_date { Date.today }
    payment_terms { 60 }

    factory :dvd_invoice do
      invoice_type { 'dvd' }
      number { '1D' }
      customer_id { 1 }
      billing_name { 'Alliance Inventory' }
      billing_address1 { '300 Omicron Court' }
      billing_address2 { 'Room 613' }
      billing_city { 'Shepherdsville' }
      billing_state { 'KY' }
      billing_zip { '40165' }
      billing_country { 'USA' }
      shipping_name { 'Alliance Inventory' }
      shipping_address1 { '300 Omicron Court' }
      shipping_address2 { 'Room 613' }
      shipping_city { 'Shepherdsville' }
      shipping_state { 'KY' }
      shipping_zip { '40165' }
      shipping_country { 'USA' }
      po_number { '549596MD' }
    end

    factory :booking_invoice do
      invoice_type { 'booking' }
      number { '1B' }
      billing_name { 'Guild Cinema' }
      billing_address1 { '3405 Central Avenue NE' }
      billing_address2 { 'Room 12' }
      billing_city { 'Albuquerque' }
      billing_state { 'NM' }
      billing_zip { '87106' }
      billing_country { 'USA' }
      shipping_name { 'Guild Cinema' }
      shipping_address1 { '3405 Central Avenue NE' }
      shipping_address2 { 'Room 12' }
      shipping_city { 'Albuquerque' }
      shipping_state { 'NM' }
      shipping_zip { '87106' }
      shipping_country { 'USA' }
      booking_id { 1 }
    end

  end

end
