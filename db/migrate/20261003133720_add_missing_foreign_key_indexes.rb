class AddMissingForeignKeyIndexes < ActiveRecord::Migration[8.1]
  def change
    # belongs_to foreign keys that had no index
    add_index :alternate_audios, :language_id
    add_index :alternate_subs, :language_id
    add_index :amazon_genre_films, :amazon_genre_id
    add_index :amazon_language_films, :amazon_language_id
    add_index :booker_venues, :booker_id
    add_index :booker_venues, :venue_id
    add_index :credit_memo_rows, :credit_memo_id
    add_index :credit_memo_rows, :dvd_id
    add_index :crossed_films, :crossed_film_id
    add_index :digital_retailer_films, :digital_retailer_id
    add_index :digital_retailer_films, :film_id
    add_index :dvd_shorts, :short_id
    add_index :edu_platform_films, :film_id
    add_index :episodes, :film_id
    add_index :film_countries, :country_id
    add_index :film_countries, :film_id
    add_index :film_formats, :film_id
    add_index :film_formats, :format_id
    add_index :film_genres, :film_id
    add_index :film_genres, :genre_id
    add_index :film_languages, :film_id
    add_index :film_languages, :language_id
    add_index :film_rights, :film_id
    add_index :film_rights, :territory_id
    add_index :film_topics, :film_id
    add_index :film_topics, :topic_id
    add_index :giftbox_dvds, :giftbox_id
    add_index :in_theaters_films, :film_id
    add_index :institution_order_films, :institution_order_id
    add_index :invoice_payments, :invoice_id
    add_index :invoice_payments, :payment_id
    add_index :invoice_rows, :invoice_id
    add_index :invoices, :customer_id
    add_index :invoices, :institution_id
    add_index :invoices, :institution_order_id
    add_index :laurels, :film_id
    add_index :merchandise_items, :merchandise_type_id
    add_index :payments, :booking_id
    add_index :purchase_order_items, :purchase_order_id
    add_index :purchase_orders, :customer_id
    add_index :purchase_orders, :number
    add_index :quotes, :film_id
    add_index :related_films, :film_id
    add_index :related_films, :other_film_id
    add_index :returns, :number
    add_index :shipping_addresses, :customer_id
    add_index :sub_rights, :film_id
    add_index :virtual_bookings, :film_id
    add_index :virtual_bookings, :venue_id

    # looked up by every worker (Job.find_by_job_id) and by the jobs polling endpoint
    add_index :jobs, :job_id
  end
end
