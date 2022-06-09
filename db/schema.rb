# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_06_09_183858) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_trgm"
  enable_extension "plpgsql"

  create_table "actors", id: :serial, force: :cascade do |t|
    t.integer "actorable_id", null: false
    t.string "first_name"
    t.string "last_name", null: false
    t.integer "order"
    t.string "actorable_type", null: false
    t.index ["actorable_id"], name: "index_actors_on_actorable_id"
  end

  create_table "aliases", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.string "text", null: false
    t.index ["film_id", "text"], name: "index_aliases_on_film_id_and_text", unique: true
  end

  create_table "alternate_audios", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "language_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["film_id", "language_id"], name: "index_alternate_audios_on_film_id_and_language_id", unique: true
  end

  create_table "alternate_lengths", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.string "length", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["film_id", "length"], name: "index_alternate_lengths_on_film_id_and_length", unique: true
  end

  create_table "alternate_subs", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "language_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["film_id", "language_id"], name: "index_alternate_subs_on_film_id_and_language_id", unique: true
  end

  create_table "booker_venues", id: :serial, force: :cascade do |t|
    t.integer "booker_id", null: false
    t.integer "venue_id", null: false
  end

  create_table "bookers", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.string "email"
    t.string "phone"
  end

  create_table "bookings", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "venue_id", null: false
    t.date "date_added", null: false
    t.string "booking_type", null: false
    t.string "status", null: false
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.string "terms", default: ""
    t.boolean "terms_change", default: false
    t.decimal "advance", precision: 8, scale: 2, default: "0.0"
    t.decimal "shipping_fee", precision: 5, scale: 2, default: "0.0"
    t.integer "screenings", default: 1
    t.integer "booker_id"
    t.integer "user_id"
    t.string "billing_name", default: ""
    t.string "billing_address1", default: ""
    t.string "billing_address2", default: ""
    t.string "billing_city", default: ""
    t.string "billing_state", default: ""
    t.string "billing_zip", default: ""
    t.string "billing_country", default: ""
    t.string "shipping_name", default: ""
    t.string "shipping_address1", default: ""
    t.string "shipping_address2", default: ""
    t.string "shipping_city", default: ""
    t.string "shipping_state", default: ""
    t.string "shipping_zip", default: ""
    t.string "shipping_country", default: ""
    t.string "email", default: ""
    t.string "imported_advance_invoice_number"
    t.date "imported_advance_invoice_sent"
    t.date "booking_confirmation_sent"
    t.string "imported_overage_invoice_number"
    t.date "imported_overage_invoice_sent"
    t.string "premiere", default: ""
    t.date "materials_sent"
    t.boolean "no_materials", default: false
    t.string "shipping_notes", default: ""
    t.string "tracking_number", default: ""
    t.boolean "delivered", default: false
    t.date "date_paid"
    t.decimal "house_expense", precision: 8, scale: 2, default: "0.0"
    t.string "notes", default: ""
    t.decimal "deduction", precision: 8, scale: 2, default: "0.0"
    t.decimal "box_office", precision: 8, scale: 2, default: "0.0"
    t.integer "old_booker_id"
    t.integer "old_user_id"
    t.boolean "box_office_received", default: false
    t.integer "format_id", default: 1
    t.boolean "exclude_from_bo_requests", default: false
    t.index ["booker_id"], name: "index_bookings_on_booker_id"
    t.index ["film_id"], name: "index_bookings_on_film_id"
    t.index ["format_id"], name: "index_bookings_on_format_id"
    t.index ["imported_advance_invoice_number"], name: "index_bookings_on_imported_advance_invoice_number"
    t.index ["imported_overage_invoice_number"], name: "index_bookings_on_imported_overage_invoice_number"
    t.index ["old_booker_id"], name: "index_bookings_on_old_booker_id"
    t.index ["old_user_id"], name: "index_bookings_on_old_user_id"
    t.index ["user_id"], name: "index_bookings_on_user_id"
    t.index ["venue_id"], name: "index_bookings_on_venue_id"
  end

  create_table "countries", id: :serial, force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "credit_memo_rows", force: :cascade do |t|
    t.integer "credit_memo_id", null: false
    t.string "item_label", null: false
    t.decimal "unit_price", precision: 8, scale: 2, default: "0.0"
    t.integer "item_qty", null: false
    t.decimal "total_price", precision: 8, scale: 2, default: "0.0"
    t.integer "dvd_id", null: false
  end

  create_table "credit_memos", force: :cascade do |t|
    t.date "sent_date", null: false
    t.string "number", null: false
    t.string "billing_name", default: ""
    t.string "billing_address1", default: ""
    t.string "billing_address2", default: ""
    t.string "billing_city", default: ""
    t.string "billing_state", default: ""
    t.string "billing_zip", default: ""
    t.string "billing_country", default: ""
    t.decimal "total", precision: 8, scale: 2, default: "0.0"
    t.string "return_number", null: false
    t.integer "customer_id", null: false
    t.integer "num"
    t.index ["customer_id"], name: "index_credit_memos_on_customer_id"
    t.index ["number"], name: "index_credit_memos_on_number", unique: true
  end

  create_table "crossed_films", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "crossed_film_id", null: false
    t.index ["film_id", "crossed_film_id"], name: "index_crossed_films_on_film_id_and_crossed_film_id", unique: true
  end

  create_table "deal_templates", id: :serial, force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "digital_retailer_films", id: :serial, force: :cascade do |t|
    t.integer "digital_retailer_id", null: false
    t.integer "film_id", null: false
    t.string "url", default: ""
  end

  create_table "digital_retailers", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.string "billing_name", default: ""
    t.string "billing_address1", default: ""
    t.string "billing_address2", default: ""
    t.string "billing_city", default: ""
    t.string "billing_state", default: ""
    t.string "billing_zip", default: ""
    t.string "billing_country", default: ""
    t.string "sage_id", default: ""
  end

  create_table "directors", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.string "first_name"
    t.string "last_name", null: false
    t.integer "order", default: 0
    t.index ["film_id"], name: "index_directors_on_film_id"
  end

  create_table "dvd_customers", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.decimal "discount", precision: 5, scale: 2
    t.boolean "consignment", null: false
    t.string "notes", default: ""
    t.string "sage_id", null: false
    t.string "invoices_email", null: false
    t.string "payment_terms", null: false
    t.decimal "per_unit", precision: 5, scale: 2
    t.string "billing_name"
    t.string "address1"
    t.string "address2"
    t.string "city"
    t.string "state"
    t.string "zip"
    t.string "country"
    t.boolean "include_in_title_report", default: false
    t.string "nickname", default: ""
    t.string "credit_memo_email", default: ""
  end

  create_table "dvd_shorts", id: :serial, force: :cascade do |t|
    t.integer "dvd_id", null: false
    t.integer "short_id", null: false
    t.index ["dvd_id", "short_id"], name: "index_dvd_shorts_on_dvd_id_and_short_id", unique: true
  end

  create_table "dvd_types", id: :serial, force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "dvds", id: :serial, force: :cascade do |t|
    t.integer "dvd_type_id", null: false
    t.integer "feature_film_id", null: false
    t.decimal "price", precision: 5, scale: 2, default: "0.0"
    t.string "upc", default: ""
    t.integer "stock", default: 0
    t.boolean "repressing", default: false
    t.string "sound_config", default: ""
    t.string "special_features", default: ""
    t.integer "discs", default: 1
    t.integer "units_shipped", default: 0
    t.date "first_shipment"
    t.date "pre_book_date"
    t.date "retail_date"
    t.index ["dvd_type_id", "feature_film_id"], name: "index_dvds_on_dvd_type_id_and_feature_film_id", unique: true
    t.index ["dvd_type_id"], name: "index_dvds_on_dvd_type_id"
    t.index ["feature_film_id"], name: "index_dvds_on_feature_film_id"
  end

  create_table "edu_platform_films", force: :cascade do |t|
    t.integer "edu_platform_id", null: false
    t.integer "film_id", null: false
    t.string "url", default: ""
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["edu_platform_id", "film_id"], name: "index_edu_platform_films_on_edu_platform_id_and_film_id", unique: true
  end

  create_table "edu_platforms", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "episodes", id: :serial, force: :cascade do |t|
    t.string "title", null: false
    t.integer "episode_number", null: false
    t.integer "season_number", null: false
    t.integer "length", null: false
    t.string "synopsis", default: ""
    t.integer "film_id", null: false
  end

  create_table "film_countries", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "country_id", null: false
    t.integer "order"
  end

  create_table "film_formats", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "format_id", null: false
  end

  create_table "film_genres", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "genre_id", null: false
    t.integer "order"
  end

  create_table "film_languages", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "language_id", null: false
    t.integer "order"
  end

  create_table "film_revenue_percentages", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "revenue_stream_id", null: false
    t.decimal "value", precision: 5, scale: 2, default: "0.0"
    t.index ["film_id"], name: "index_film_revenue_percentages_on_film_id"
    t.index ["revenue_stream_id"], name: "index_film_revenue_percentages_on_revenue_stream_id"
  end

  create_table "film_rights", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "right_id", null: false
    t.integer "territory_id"
    t.date "start_date"
    t.date "end_date"
    t.boolean "exclusive", default: false
    t.date "end_date_calc"
    t.index ["right_id", "film_id", "territory_id"], name: "index_film_rights_on_right_id_and_film_id_and_territory_id", unique: true
  end

  create_table "film_topics", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "topic_id", null: false
  end

  create_table "films", id: :serial, force: :cascade do |t|
    t.string "title", null: false
    t.integer "feature_id"
    t.integer "label_id", null: false
    t.integer "licensor_id"
    t.integer "deal_type_id", default: 1
    t.integer "days_statement_due"
    t.decimal "gr_percentage", precision: 5, scale: 2
    t.decimal "mg", precision: 8, scale: 2, default: "0.0"
    t.decimal "e_and_o", precision: 8, scale: 2, default: "0.0"
    t.decimal "expense_cap", precision: 8, scale: 2, default: "0.0"
    t.string "sage_id", default: ""
    t.string "royalty_notes", default: ""
    t.boolean "export_reports", default: true
    t.boolean "send_reports", default: true
    t.boolean "reserve", default: false
    t.decimal "reserve_percentage", precision: 5, scale: 2, default: "0.0"
    t.integer "reserve_quarters", default: 0
    t.integer "sell_off_period", default: 0
    t.boolean "auto_renew", default: false
    t.integer "auto_renew_term", default: 0
    t.integer "year"
    t.integer "length"
    t.string "synopsis", default: ""
    t.string "short_synopsis", default: ""
    t.string "logline", default: ""
    t.string "vod_synopsis", default: ""
    t.string "institutional_synopsis", default: ""
    t.string "vimeo_trailer", default: ""
    t.string "youtube_trailer", default: ""
    t.string "prores_trailer", default: ""
    t.string "standalone_site", default: ""
    t.string "facebook_link", default: ""
    t.string "twitter_link", default: ""
    t.string "instagram_link", default: ""
    t.boolean "active", default: true
    t.date "club_date"
    t.boolean "ignore_sage_id", default: false
    t.date "start_date"
    t.date "end_date"
    t.string "film_type"
    t.date "avod_release"
    t.date "svod_release"
    t.date "tvod_release"
    t.boolean "svod_tentative", default: false
    t.boolean "avod_tentative", default: false
    t.boolean "tvod_tentative", default: false
    t.boolean "edu_page", default: false
    t.boolean "video_page", default: false
    t.string "artwork_url", default: ""
    t.date "theatrical_release"
    t.boolean "theatrical_tentative", default: false
    t.string "fm_plus_url", default: ""
    t.text "aspect_ratio", default: ""
    t.text "rating", default: ""
    t.text "sound_config", default: ""
    t.boolean "certified_fresh", default: false
    t.boolean "critics_pick", default: false
    t.string "imdb_id", default: ""
    t.datetime "created_at"
    t.datetime "updated_at"
    t.date "accept_delivery"
    t.boolean "day_and_date", default: false
    t.integer "auto_renew_days_notice", default: 0
    t.string "rental_url", default: ""
    t.decimal "rental_price", precision: 5, scale: 2, default: "0.0"
    t.integer "rental_days", default: 0
    t.string "tv_rating", default: ""
    t.string "contractual_obligations", default: ""
    t.date "expiration_reminders", default: [], array: true
    t.date "fm_plus_release"
    t.boolean "fm_plus_tentative", default: false
    t.decimal "msrp_pre_street", precision: 5, scale: 2, default: "0.0"
    t.decimal "ppr_pre_street", precision: 7, scale: 2, default: "0.0"
    t.decimal "ppr_post_street", precision: 7, scale: 2, default: "0.0"
    t.decimal "drl_pre_street", precision: 7, scale: 2, default: "0.0"
    t.decimal "drl_post_street", precision: 7, scale: 2, default: "0.0"
    t.decimal "ppr_drl_pre_street", precision: 7, scale: 2, default: "0.0"
    t.decimal "ppr_drl_post_street", precision: 7, scale: 2, default: "0.0"
    t.decimal "msrp_pre_street_member", precision: 5, scale: 2, default: "0.0"
    t.decimal "ppr_pre_street_member", precision: 7, scale: 2, default: "0.0"
    t.decimal "ppr_post_street_member", precision: 7, scale: 2, default: "0.0"
    t.decimal "drl_pre_street_member", precision: 7, scale: 2, default: "0.0"
    t.decimal "drl_post_street_member", precision: 7, scale: 2, default: "0.0"
    t.decimal "ppr_drl_pre_street_member", precision: 7, scale: 2, default: "0.0"
    t.decimal "ppr_drl_post_street_member", precision: 7, scale: 2, default: "0.0"
    t.boolean "auto_renew_opt_out", default: false
    t.index ["deal_type_id"], name: "index_films_on_deal_type_id"
    t.index ["feature_id"], name: "index_films_on_feature_id"
    t.index ["label_id"], name: "index_films_on_label_id"
    t.index ["licensor_id"], name: "index_films_on_licensor_id"
  end

  create_table "formats", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.boolean "active", default: true
    t.index ["name"], name: "index_formats_on_name", unique: true
  end

  create_table "genres", id: :serial, force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "giftbox_dvds", id: :serial, force: :cascade do |t|
    t.integer "dvd_id", null: false
    t.integer "giftbox_id", null: false
    t.index ["dvd_id", "giftbox_id"], name: "index_giftbox_dvds_on_dvd_id_and_giftbox_id", unique: true
  end

  create_table "giftboxes", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.string "upc", null: false
    t.decimal "msrp", precision: 5, scale: 2, default: "0.0"
    t.boolean "on_demand", default: false
    t.integer "quantity", default: 0
    t.string "sage_id", default: ""
  end

  create_table "in_theaters_films", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "order", null: false
    t.text "section", null: false
  end

  create_table "invoice_payments", id: :serial, force: :cascade do |t|
    t.integer "invoice_id", null: false
    t.integer "payment_id", null: false
    t.decimal "amount", precision: 8, scale: 2, default: "0.0"
    t.string "notes", default: ""
    t.date "date", null: false
  end

  create_table "invoice_rows", id: :serial, force: :cascade do |t|
    t.integer "invoice_id", null: false
    t.string "item_label", null: false
    t.decimal "unit_price", precision: 8, scale: 2, default: "0.0"
    t.integer "item_qty", null: false
    t.decimal "total_price", precision: 8, scale: 2, default: "0.0"
    t.integer "item_id"
    t.string "item_type"
    t.string "item_label_export"
  end

  create_table "invoices", id: :serial, force: :cascade do |t|
    t.string "invoice_type", null: false
    t.date "sent_date"
    t.string "number", null: false
    t.string "billing_name", default: ""
    t.string "billing_address1", default: ""
    t.string "billing_address2", default: ""
    t.string "billing_city", default: ""
    t.string "billing_state", default: ""
    t.string "billing_zip", default: ""
    t.string "billing_country", default: ""
    t.string "shipping_name", default: ""
    t.string "shipping_address1", default: ""
    t.string "shipping_address2", default: ""
    t.string "shipping_city", default: ""
    t.string "shipping_state", default: ""
    t.string "shipping_zip", default: ""
    t.string "shipping_country", default: ""
    t.decimal "sub_total", precision: 8, scale: 2, default: "0.0"
    t.decimal "total", precision: 8, scale: 2, default: "0.0"
    t.string "po_number"
    t.integer "payment_terms"
    t.string "notes", default: ""
    t.integer "customer_id"
    t.integer "booking_id"
    t.integer "num"
    t.string "booking_type", default: "Booking"
    t.index ["booking_id"], name: "index_invoices_on_booking_id"
    t.index ["number"], name: "index_invoices_on_number", unique: true
  end

  create_table "jobs", id: :serial, force: :cascade do |t|
    t.string "job_id", null: false
    t.string "first_line"
    t.boolean "second_line", default: false
    t.integer "current_value", default: 0
    t.integer "total_value", default: 0
    t.string "errors_text", default: ""
    t.string "name"
    t.jsonb "metadata"
    t.integer "status", default: 0
  end

  create_table "labels", id: :serial, force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "languages", id: :serial, force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "laurels", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.string "result", null: false
    t.string "award_name"
    t.string "festival", null: false
    t.integer "order", null: false
  end

  create_table "licensors", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.string "email"
    t.string "address"
    t.index ["name"], name: "index_licensors_on_name", unique: true
  end

  create_table "merchandise_items", id: :serial, force: :cascade do |t|
    t.integer "merchandise_type_id", null: false
    t.string "name", null: false
    t.string "size", default: ""
    t.decimal "price", precision: 5, scale: 2, default: "0.0"
    t.integer "inventory", default: 0
    t.text "description", default: ""
    t.integer "film_id"
  end

  create_table "merchandise_types", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.index ["name"], name: "index_merchandise_types_on_name", unique: true
  end

  create_table "past_bookers", id: :serial, force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "payments", id: :serial, force: :cascade do |t|
    t.integer "booking_id"
    t.decimal "amount", precision: 8, scale: 2, default: "0.0"
    t.date "date"
    t.string "notes"
    t.string "booking_type", default: "Booking"
  end

  create_table "purchase_order_items", id: :serial, force: :cascade do |t|
    t.integer "purchase_order_id", null: false
    t.string "item_type", null: false
    t.integer "item_id", null: false
    t.integer "order", null: false
    t.integer "qty", default: 0
  end

  create_table "purchase_orders", id: :serial, force: :cascade do |t|
    t.string "number", null: false
    t.integer "customer_id", default: 0
    t.string "address1", default: ""
    t.string "address2", default: ""
    t.string "city", default: ""
    t.string "state", default: ""
    t.string "zip", default: ""
    t.date "order_date"
    t.date "ship_date"
    t.string "name", default: ""
    t.string "country", default: ""
    t.boolean "send_invoice", default: true
    t.string "source_doc"
    t.string "notes", default: ""
    t.integer "year", null: false
    t.integer "month", null: false
    t.boolean "reporting_only", default: false
  end

  create_table "quotes", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.string "text", null: false
    t.string "author"
    t.string "publication"
    t.integer "order", null: false
  end

  create_table "related_films", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "other_film_id", null: false
    t.integer "order", null: false
  end

  create_table "return_items", id: :serial, force: :cascade do |t|
    t.integer "return_id", null: false
    t.string "item_type", null: false
    t.integer "item_id", null: false
    t.integer "order", null: false
    t.integer "qty", null: false
    t.decimal "amount", precision: 8, scale: 2, default: "0.0"
    t.index ["item_id"], name: "index_return_items_on_item_id"
    t.index ["return_id"], name: "index_return_items_on_return_id"
  end

  create_table "returns", id: :serial, force: :cascade do |t|
    t.string "number", null: false
    t.date "date", null: false
    t.integer "customer_id", null: false
    t.integer "month", null: false
    t.integer "year", null: false
    t.index ["customer_id"], name: "index_returns_on_customer_id"
  end

  create_table "revenue_streams", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.text "nickname"
    t.integer "order"
  end

  create_table "rights", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.integer "order", null: false
  end

  create_table "royalty_reports", id: :serial, force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "year", null: false
    t.integer "quarter", null: false
    t.decimal "cume_total", precision: 8, scale: 2, default: "0.0"
    t.decimal "mg", precision: 8, scale: 2, default: "0.0"
    t.decimal "e_and_o", precision: 8, scale: 2, default: "0.0"
    t.decimal "amount_paid", precision: 8, scale: 2, default: "0.0"
    t.decimal "amount_due", precision: 8, scale: 2, default: "0.0"
    t.integer "deal_id", null: false
    t.decimal "gr_percentage", precision: 5, scale: 2, default: "0.0"
    t.decimal "current_total_expenses", precision: 8, scale: 2, default: "0.0"
    t.decimal "cume_total_expenses", precision: 8, scale: 2, default: "0.0"
    t.decimal "current_total", precision: 8, scale: 2, default: "0.0"
    t.decimal "current_total_revenue", precision: 8, scale: 2, default: "0.0"
    t.decimal "cume_total_revenue", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_total_revenue", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_total_expenses", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_total", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_amount_due", precision: 8, scale: 2, default: "0.0"
    t.decimal "current_share_minus_expenses", precision: 8, scale: 2, default: "0.0"
    t.date "date_sent"
    t.decimal "current_reserve", precision: 8, scale: 2, default: "0.0"
    t.decimal "cume_reserve", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_liquidated_reserve", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_reserve", precision: 8, scale: 2, default: "0.0"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.decimal "cume_liquidated_reserve", precision: 8, scale: 2, default: "0.0"
    t.decimal "current_liquidated_reserve", precision: 8, scale: 2, default: "0.0"
    t.index ["film_id"], name: "index_royalty_reports_on_film_id"
  end

  create_table "royalty_revenue_streams", id: :serial, force: :cascade do |t|
    t.integer "royalty_report_id", null: false
    t.integer "revenue_stream_id", null: false
    t.decimal "current_revenue", precision: 8, scale: 2, default: "0.0"
    t.decimal "current_gr", precision: 8, scale: 2, default: "0.0"
    t.decimal "current_expense", precision: 8, scale: 2, default: "0.0"
    t.decimal "current_difference", precision: 8, scale: 2, default: "0.0"
    t.decimal "current_licensor_share", precision: 8, scale: 2, default: "0.0"
    t.decimal "cume_revenue", precision: 8, scale: 2, default: "0.0"
    t.decimal "cume_gr", precision: 8, scale: 2, default: "0.0"
    t.decimal "cume_expense", precision: 8, scale: 2, default: "0.0"
    t.decimal "cume_difference", precision: 8, scale: 2, default: "0.0"
    t.decimal "cume_licensor_share", precision: 8, scale: 2, default: "0.0"
    t.decimal "licensor_percentage", precision: 5, scale: 2, default: "0.0"
    t.decimal "joined_revenue", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_gr", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_expense", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_difference", precision: 8, scale: 2, default: "0.0"
    t.decimal "joined_licensor_share", precision: 8, scale: 2, default: "0.0"
    t.index ["revenue_stream_id"], name: "index_royalty_revenue_streams_on_revenue_stream_id"
    t.index ["royalty_report_id"], name: "index_royalty_revenue_streams_on_royalty_report_id"
  end

  create_table "settings", id: :serial, force: :cascade do |t|
    t.string "booking_confirmation_text", default: ""
    t.integer "next_booking_invoice_number", default: 1
    t.integer "next_dvd_invoice_number", default: 1
    t.string "dvd_invoice_email_text", default: ""
    t.string "paid_booking_invoice_email_text", default: ""
    t.string "partially_paid_booking_invoice_email_text", default: ""
    t.string "unpaid_overage_booking_invoice_email_text", default: ""
    t.string "unpaid_non_overage_booking_invoice_email_text", default: ""
    t.string "booking_invoice_payment_info_email_text", default: ""
    t.string "shipping_terms_email_text", default: ""
    t.string "all_booking_invoices_email_text", default: ""
    t.integer "next_credit_memo_number", default: 1
    t.string "credit_memo_email_text", default: ""
    t.integer "box_office_reminders_user_id"
    t.string "virtual_booking_report_text", default: ""
  end

  create_table "shipping_addresses", id: :serial, force: :cascade do |t|
    t.string "label"
    t.string "address1"
    t.string "address2"
    t.string "city"
    t.string "state"
    t.string "zip"
    t.string "country"
    t.integer "customer_id", default: 0
    t.string "name"
  end

  create_table "sub_rights", id: :serial, force: :cascade do |t|
    t.integer "right_id", null: false
    t.integer "sublicensor_id", null: false
    t.integer "territory_id", null: false
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.boolean "exclusive", default: false
    t.integer "film_id", null: false
    t.date "expiration_reminders", default: [], array: true
    t.index ["right_id"], name: "index_sub_rights_on_right_id"
    t.index ["sublicensor_id"], name: "index_sub_rights_on_sublicensor_id"
    t.index ["territory_id"], name: "index_sub_rights_on_territory_id"
  end

  create_table "sublicensors", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.string "email", default: ""
    t.string "phone", default: ""
    t.string "contact_name", default: ""
    t.boolean "w8", default: false
  end

  create_table "territories", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.boolean "world", default: false
  end

  create_table "topics", id: :serial, force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email", null: false
    t.string "encrypted_password", limit: 128, null: false
    t.string "confirmation_token", limit: 128
    t.string "remember_token", limit: 128, null: false
    t.string "name", null: false
    t.string "title"
    t.string "email_signature"
    t.boolean "admin", default: false
    t.boolean "booker", default: false
    t.integer "access", default: 50
    t.boolean "inactive", default: false
    t.boolean "has_auto_renew_approval", default: false
    t.index ["email"], name: "index_users_on_email"
    t.index ["remember_token"], name: "index_users_on_remember_token"
  end

  create_table "venues", id: :serial, force: :cascade do |t|
    t.string "label", null: false
    t.string "billing_name", default: ""
    t.string "billing_address1", default: ""
    t.string "billing_address2", default: ""
    t.string "billing_city", default: ""
    t.string "billing_state", default: ""
    t.string "billing_zip", default: ""
    t.string "billing_country", default: ""
    t.string "shipping_name", default: ""
    t.string "shipping_address1", default: ""
    t.string "shipping_address2", default: ""
    t.string "shipping_city", default: ""
    t.string "shipping_state", default: ""
    t.string "shipping_zip", default: ""
    t.string "shipping_country", default: ""
    t.string "website", default: ""
    t.string "sage_id"
    t.string "email", default: ""
    t.string "phone", default: ""
    t.string "notes", default: ""
    t.string "venue_type", null: false
    t.string "contact_name", default: ""
  end

  create_table "virtual_bookings", force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "venue_id", null: false
    t.date "date_added", null: false
    t.date "start_date", null: false
    t.date "end_date", null: false
    t.string "shipping_city", default: ""
    t.string "shipping_state", default: ""
    t.string "terms", default: ""
    t.string "url", default: "", null: false
    t.integer "host", default: 0
    t.decimal "deduction", precision: 8, scale: 2, default: "0.0"
    t.decimal "box_office", precision: 8, scale: 2, default: "0.0"
    t.boolean "box_office_received", default: false
    t.string "email", default: ""
    t.date "report_sent_date"
    t.date "report_sent"
    t.string "billing_name", default: ""
    t.string "billing_address1", default: ""
    t.string "billing_address2", default: ""
    t.string "billing_city", default: ""
    t.string "billing_state", default: ""
    t.string "billing_zip", default: ""
    t.string "billing_country", default: ""
  end

  create_table "weekly_box_offices", id: :serial, force: :cascade do |t|
    t.integer "order", null: false
    t.integer "booking_id", null: false
    t.decimal "amount", precision: 8, scale: 2, default: "0.0"
    t.index ["booking_id"], name: "index_weekly_box_offices_on_booking_id"
  end

  create_table "weekly_terms", id: :serial, force: :cascade do |t|
    t.integer "booking_id", null: false
    t.string "terms", null: false
    t.integer "order", null: false
    t.index ["booking_id"], name: "index_weekly_terms_on_booking_id"
  end

end
