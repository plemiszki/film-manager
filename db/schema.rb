# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20190512190415) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "actors", force: :cascade do |t|
    t.integer "actorable_id",   null: false
    t.string  "first_name"
    t.string  "last_name",      null: false
    t.integer "order"
    t.string  "actorable_type", null: false
  end

  add_index "actors", ["actorable_id"], name: "index_actors_on_actorable_id", using: :btree

  create_table "aliases", force: :cascade do |t|
    t.integer "film_id", null: false
    t.string  "text",    null: false
  end

  add_index "aliases", ["film_id", "text"], name: "index_aliases_on_film_id_and_text", unique: true, using: :btree

  create_table "booker_venues", force: :cascade do |t|
    t.integer "booker_id", null: false
    t.integer "venue_id",  null: false
  end

  create_table "bookers", force: :cascade do |t|
    t.string "name",  null: false
    t.string "email"
    t.string "phone"
  end

  create_table "bookings", force: :cascade do |t|
    t.integer "film_id",                                                                 null: false
    t.integer "venue_id",                                                                null: false
    t.date    "date_added",                                                              null: false
    t.string  "booking_type",                                                            null: false
    t.string  "status",                                                                  null: false
    t.date    "start_date",                                                              null: false
    t.date    "end_date",                                                                null: false
    t.string  "terms",                                                   default: ""
    t.boolean "terms_change",                                            default: false
    t.decimal "advance",                         precision: 8, scale: 2, default: 0.0
    t.decimal "shipping_fee",                    precision: 5, scale: 2, default: 0.0
    t.integer "screenings",                                              default: 1
    t.integer "booker_id"
    t.integer "user_id"
    t.string  "billing_name",                                            default: ""
    t.string  "billing_address1",                                        default: ""
    t.string  "billing_address2",                                        default: ""
    t.string  "billing_city",                                            default: ""
    t.string  "billing_state",                                           default: ""
    t.string  "billing_zip",                                             default: ""
    t.string  "billing_country",                                         default: ""
    t.string  "shipping_name",                                           default: ""
    t.string  "shipping_address1",                                       default: ""
    t.string  "shipping_address2",                                       default: ""
    t.string  "shipping_city",                                           default: ""
    t.string  "shipping_state",                                          default: ""
    t.string  "shipping_zip",                                            default: ""
    t.string  "shipping_country",                                        default: ""
    t.string  "email",                                                   default: ""
    t.string  "imported_advance_invoice_number"
    t.date    "imported_advance_invoice_sent"
    t.date    "booking_confirmation_sent"
    t.string  "imported_overage_invoice_number"
    t.date    "imported_overage_invoice_sent"
    t.string  "premiere",                                                default: ""
    t.date    "materials_sent"
    t.boolean "no_materials",                                            default: false
    t.string  "shipping_notes",                                          default: ""
    t.string  "tracking_number",                                         default: ""
    t.boolean "delivered",                                               default: false
    t.date    "date_paid"
    t.decimal "house_expense",                   precision: 8, scale: 2, default: 0.0
    t.string  "notes",                                                   default: ""
    t.decimal "deduction",                       precision: 8, scale: 2, default: 0.0
    t.decimal "box_office",                      precision: 8, scale: 2, default: 0.0
    t.integer "old_booker_id"
    t.integer "old_user_id"
    t.boolean "box_office_received",                                     default: false
    t.integer "format_id",                                               default: 1
  end

  add_index "bookings", ["booker_id"], name: "index_bookings_on_booker_id", using: :btree
  add_index "bookings", ["film_id"], name: "index_bookings_on_film_id", using: :btree
  add_index "bookings", ["format_id"], name: "index_bookings_on_format_id", using: :btree
  add_index "bookings", ["imported_advance_invoice_number"], name: "index_bookings_on_imported_advance_invoice_number", using: :btree
  add_index "bookings", ["imported_overage_invoice_number"], name: "index_bookings_on_imported_overage_invoice_number", using: :btree
  add_index "bookings", ["old_booker_id"], name: "index_bookings_on_old_booker_id", using: :btree
  add_index "bookings", ["old_user_id"], name: "index_bookings_on_old_user_id", using: :btree
  add_index "bookings", ["user_id"], name: "index_bookings_on_user_id", using: :btree
  add_index "bookings", ["venue_id"], name: "index_bookings_on_venue_id", using: :btree

  create_table "countries", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "crossed_films", force: :cascade do |t|
    t.integer "film_id",         null: false
    t.integer "crossed_film_id", null: false
  end

  add_index "crossed_films", ["film_id", "crossed_film_id"], name: "index_crossed_films_on_film_id_and_crossed_film_id", unique: true, using: :btree

  create_table "deal_templates", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "digital_retailer_films", force: :cascade do |t|
    t.integer "digital_retailer_id",              null: false
    t.integer "film_id",                          null: false
    t.string  "url",                 default: ""
  end

  create_table "digital_retailers", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "directors", force: :cascade do |t|
    t.integer "film_id",    null: false
    t.string  "first_name"
    t.string  "last_name",  null: false
  end

  add_index "directors", ["film_id"], name: "index_directors_on_film_id", using: :btree

  create_table "dvd_customers", force: :cascade do |t|
    t.string  "name",                                                null: false
    t.decimal "discount",       precision: 5, scale: 2
    t.boolean "consignment",                                         null: false
    t.string  "notes",                                  default: ""
    t.string  "sage_id",                                             null: false
    t.string  "invoices_email",                                      null: false
    t.string  "payment_terms",                                       null: false
    t.decimal "per_unit",       precision: 5, scale: 2
    t.string  "billing_name"
    t.string  "address1"
    t.string  "address2"
    t.string  "city"
    t.string  "state"
    t.string  "zip"
    t.string  "country"
  end

  create_table "dvd_shorts", force: :cascade do |t|
    t.integer "dvd_id",   null: false
    t.integer "short_id", null: false
  end

  add_index "dvd_shorts", ["dvd_id", "short_id"], name: "index_dvd_shorts_on_dvd_id_and_short_id", unique: true, using: :btree

  create_table "dvd_types", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "dvds", force: :cascade do |t|
    t.integer "dvd_type_id",                                              null: false
    t.integer "feature_film_id",                                          null: false
    t.decimal "price",            precision: 5, scale: 2, default: 0.0
    t.string  "upc",                                      default: ""
    t.integer "stock",                                    default: 0
    t.boolean "repressing",                               default: false
    t.string  "sound_config",                             default: ""
    t.string  "special_features",                         default: ""
    t.integer "discs",                                    default: 1
    t.integer "units_shipped",                            default: 0
    t.date    "first_shipment"
    t.date    "pre_book_date"
    t.date    "retail_date"
  end

  add_index "dvds", ["dvd_type_id", "feature_film_id"], name: "index_dvds_on_dvd_type_id_and_feature_film_id", unique: true, using: :btree
  add_index "dvds", ["dvd_type_id"], name: "index_dvds_on_dvd_type_id", using: :btree
  add_index "dvds", ["feature_film_id"], name: "index_dvds_on_feature_film_id", using: :btree

  create_table "episodes", force: :cascade do |t|
    t.string  "title",                       null: false
    t.integer "episode_number",              null: false
    t.integer "season_number",               null: false
    t.integer "length",                      null: false
    t.string  "synopsis",       default: ""
    t.integer "film_id",                     null: false
  end

  create_table "film_countries", force: :cascade do |t|
    t.integer "film_id",    null: false
    t.integer "country_id", null: false
    t.integer "order"
  end

  create_table "film_formats", force: :cascade do |t|
    t.integer "film_id",   null: false
    t.integer "format_id", null: false
  end

  create_table "film_genres", force: :cascade do |t|
    t.integer "film_id",  null: false
    t.integer "genre_id", null: false
    t.integer "order"
  end

  create_table "film_languages", force: :cascade do |t|
    t.integer "film_id",     null: false
    t.integer "language_id", null: false
    t.integer "order"
  end

  create_table "film_revenue_percentages", force: :cascade do |t|
    t.integer "film_id",                                                 null: false
    t.integer "revenue_stream_id",                                       null: false
    t.decimal "value",             precision: 5, scale: 2, default: 0.0
  end

  add_index "film_revenue_percentages", ["film_id"], name: "index_film_revenue_percentages_on_film_id", using: :btree
  add_index "film_revenue_percentages", ["revenue_stream_id"], name: "index_film_revenue_percentages_on_revenue_stream_id", using: :btree

  create_table "film_rights", force: :cascade do |t|
    t.integer "film_id",                      null: false
    t.integer "right_id",                     null: false
    t.integer "territory_id"
    t.date    "start_date"
    t.date    "end_date"
    t.boolean "exclusive",    default: false
  end

  add_index "film_rights", ["right_id", "film_id", "territory_id"], name: "index_film_rights_on_right_id_and_film_id_and_territory_id", unique: true, using: :btree

  create_table "film_topics", force: :cascade do |t|
    t.integer "film_id",  null: false
    t.integer "topic_id", null: false
  end

  create_table "films", force: :cascade do |t|
    t.string  "title",                                                          null: false
    t.integer "feature_id"
    t.integer "label_id",                                                       null: false
    t.integer "licensor_id"
    t.integer "deal_type_id",                                   default: 1
    t.integer "days_statement_due"
    t.decimal "gr_percentage",          precision: 5, scale: 2
    t.decimal "mg",                     precision: 8, scale: 2, default: 0.0
    t.decimal "e_and_o",                precision: 8, scale: 2, default: 0.0
    t.decimal "expense_cap",            precision: 8, scale: 2, default: 0.0
    t.string  "sage_id",                                        default: ""
    t.string  "royalty_notes",                                  default: ""
    t.boolean "export_reports",                                 default: true
    t.boolean "send_reports",                                   default: true
    t.boolean "reserve",                                        default: false
    t.decimal "reserve_percentage",     precision: 5, scale: 2, default: 0.0
    t.integer "reserve_quarters",                               default: 0
    t.integer "sell_off_period",                                default: 0
    t.boolean "auto_renew",                                     default: false
    t.integer "auto_renew_term",                                default: 0
    t.integer "year"
    t.integer "length"
    t.string  "synopsis",                                       default: ""
    t.string  "short_synopsis",                                 default: ""
    t.string  "logline",                                        default: ""
    t.string  "vod_synopsis",                                   default: ""
    t.string  "institutional_synopsis",                         default: ""
    t.string  "vimeo_trailer",                                  default: ""
    t.string  "youtube_trailer",                                default: ""
    t.string  "prores_trailer",                                 default: ""
    t.string  "standalone_site",                                default: ""
    t.string  "facebook_link",                                  default: ""
    t.string  "twitter_link",                                   default: ""
    t.string  "instagram_link",                                 default: ""
    t.boolean "active",                                         default: true
    t.date    "club_date"
    t.boolean "ignore_sage_id",                                 default: false
    t.date    "start_date"
    t.date    "end_date"
    t.string  "film_type"
    t.date    "avod_release"
    t.date    "svod_release"
    t.date    "tvod_release"
    t.boolean "svod_tentative",                                 default: false
    t.boolean "avod_tentative",                                 default: false
    t.boolean "tvod_tentative",                                 default: false
    t.boolean "edu_page",                                       default: false
    t.boolean "video_page",                                     default: false
    t.string  "artwork_url",                                    default: ""
    t.date    "theatrical_release"
    t.boolean "theatrical_tentative",                           default: false
    t.string  "fm_plus_url",                                    default: ""
    t.text    "aspect_ratio",                                   default: ""
    t.text    "rating",                                         default: ""
    t.text    "sound_config",                                   default: ""
    t.boolean "certified_fresh",                                default: false
    t.boolean "critics_pick",                                   default: false
    t.string  "imdb_id",                                        default: ""
  end

  add_index "films", ["deal_type_id"], name: "index_films_on_deal_type_id", using: :btree
  add_index "films", ["feature_id"], name: "index_films_on_feature_id", using: :btree
  add_index "films", ["label_id"], name: "index_films_on_label_id", using: :btree
  add_index "films", ["licensor_id"], name: "index_films_on_licensor_id", using: :btree

  create_table "formats", force: :cascade do |t|
    t.string "name", null: false
  end

  add_index "formats", ["name"], name: "index_formats_on_name", unique: true, using: :btree

  create_table "genres", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "giftbox_dvds", force: :cascade do |t|
    t.integer "dvd_id",     null: false
    t.integer "giftbox_id", null: false
  end

  add_index "giftbox_dvds", ["dvd_id", "giftbox_id"], name: "index_giftbox_dvds_on_dvd_id_and_giftbox_id", unique: true, using: :btree

  create_table "giftboxes", force: :cascade do |t|
    t.string  "name",                                              null: false
    t.string  "upc",                                               null: false
    t.decimal "msrp",      precision: 5, scale: 2, default: 0.0
    t.boolean "on_demand",                         default: false
    t.integer "quantity",                          default: 0
    t.string  "sage_id",                           default: ""
  end

  create_table "in_theaters_films", force: :cascade do |t|
    t.integer "film_id", null: false
    t.integer "order",   null: false
    t.text    "section", null: false
  end

  create_table "invoice_payments", force: :cascade do |t|
    t.integer "invoice_id",                                       null: false
    t.integer "payment_id",                                       null: false
    t.decimal "amount",     precision: 8, scale: 2, default: 0.0
    t.string  "notes",                              default: ""
    t.date    "date",                                             null: false
  end

  create_table "invoice_rows", force: :cascade do |t|
    t.integer "invoice_id",                                        null: false
    t.string  "item_label",                                        null: false
    t.decimal "unit_price",  precision: 8, scale: 2, default: 0.0
    t.integer "item_qty",                                          null: false
    t.decimal "total_price", precision: 8, scale: 2, default: 0.0
    t.integer "item_id"
    t.string  "item_type"
  end

  create_table "invoices", force: :cascade do |t|
    t.string  "invoice_type",                                            null: false
    t.date    "sent_date"
    t.string  "number",                                                  null: false
    t.string  "billing_name",                              default: ""
    t.string  "billing_address1",                          default: ""
    t.string  "billing_address2",                          default: ""
    t.string  "billing_city",                              default: ""
    t.string  "billing_state",                             default: ""
    t.string  "billing_zip",                               default: ""
    t.string  "billing_country",                           default: ""
    t.string  "shipping_name",                             default: ""
    t.string  "shipping_address1",                         default: ""
    t.string  "shipping_address2",                         default: ""
    t.string  "shipping_city",                             default: ""
    t.string  "shipping_state",                            default: ""
    t.string  "shipping_zip",                              default: ""
    t.string  "shipping_country",                          default: ""
    t.decimal "sub_total",         precision: 8, scale: 2, default: 0.0
    t.decimal "total",             precision: 8, scale: 2, default: 0.0
    t.string  "po_number"
    t.integer "payment_terms"
    t.string  "notes",                                     default: ""
    t.integer "customer_id"
    t.integer "booking_id"
  end

  add_index "invoices", ["booking_id"], name: "index_invoices_on_booking_id", using: :btree
  add_index "invoices", ["number"], name: "index_invoices_on_number", unique: true, using: :btree

  create_table "jobs", force: :cascade do |t|
    t.string  "job_id",                        null: false
    t.string  "first_line"
    t.boolean "second_line",   default: false
    t.integer "current_value", default: 0
    t.integer "total_value",   default: 0
    t.string  "errors_text",   default: ""
    t.string  "name"
    t.boolean "done",          default: false
  end

  create_table "labels", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "languages", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "laurels", force: :cascade do |t|
    t.integer "film_id",    null: false
    t.string  "result",     null: false
    t.string  "award_name"
    t.string  "festival",   null: false
    t.integer "order",      null: false
  end

  create_table "licensors", force: :cascade do |t|
    t.string "name",    null: false
    t.string "email"
    t.string "address"
  end

  add_index "licensors", ["name"], name: "index_licensors_on_name", unique: true, using: :btree

  create_table "merchandise_items", force: :cascade do |t|
    t.integer "merchandise_type_id",                                       null: false
    t.string  "name",                                                      null: false
    t.string  "size",                                        default: ""
    t.decimal "price",               precision: 5, scale: 2, default: 0.0
    t.integer "inventory",                                   default: 0
    t.text    "description",                                 default: ""
    t.integer "film_id"
  end

  create_table "merchandise_types", force: :cascade do |t|
    t.string "name", null: false
  end

  add_index "merchandise_types", ["name"], name: "index_merchandise_types_on_name", unique: true, using: :btree

  create_table "past_bookers", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "payments", force: :cascade do |t|
    t.integer "booking_id"
    t.decimal "amount",     precision: 8, scale: 2, default: 0.0
    t.date    "date"
    t.string  "notes"
  end

  create_table "purchase_order_items", force: :cascade do |t|
    t.integer "purchase_order_id",             null: false
    t.string  "item_type",                     null: false
    t.integer "item_id",                       null: false
    t.integer "order",                         null: false
    t.integer "qty",               default: 0
  end

  create_table "purchase_orders", force: :cascade do |t|
    t.string  "number",                         null: false
    t.integer "customer_id",    default: 0
    t.string  "address1",       default: ""
    t.string  "address2",       default: ""
    t.string  "city",           default: ""
    t.string  "state",          default: ""
    t.string  "zip",            default: ""
    t.date    "order_date"
    t.date    "ship_date"
    t.string  "name",           default: ""
    t.string  "country",        default: ""
    t.boolean "send_invoice",   default: true
    t.string  "source_doc"
    t.string  "notes",          default: ""
    t.integer "year",                           null: false
    t.integer "month",                          null: false
    t.boolean "reporting_only", default: false
  end

  create_table "quotes", force: :cascade do |t|
    t.integer "film_id",     null: false
    t.string  "text",        null: false
    t.string  "author"
    t.string  "publication"
    t.integer "order",       null: false
  end

  create_table "related_films", force: :cascade do |t|
    t.integer "film_id",       null: false
    t.integer "other_film_id", null: false
    t.integer "order",         null: false
  end

  create_table "return_items", force: :cascade do |t|
    t.integer "return_id",                                       null: false
    t.string  "item_type",                                       null: false
    t.integer "item_id",                                         null: false
    t.integer "order",                                           null: false
    t.integer "qty",                                             null: false
    t.decimal "amount",    precision: 8, scale: 2, default: 0.0
  end

  add_index "return_items", ["item_id"], name: "index_return_items_on_item_id", using: :btree
  add_index "return_items", ["return_id"], name: "index_return_items_on_return_id", using: :btree

  create_table "returns", force: :cascade do |t|
    t.string  "number",      null: false
    t.date    "date",        null: false
    t.integer "customer_id", null: false
    t.integer "month",       null: false
    t.integer "year",        null: false
  end

  add_index "returns", ["customer_id"], name: "index_returns_on_customer_id", using: :btree

  create_table "revenue_streams", force: :cascade do |t|
    t.string  "name",     null: false
    t.text    "nickname"
    t.integer "order"
  end

  create_table "rights", force: :cascade do |t|
    t.string  "name",  null: false
    t.integer "order", null: false
  end

  create_table "royalty_reports", force: :cascade do |t|
    t.integer "film_id",                                                            null: false
    t.integer "year",                                                               null: false
    t.integer "quarter",                                                            null: false
    t.decimal "cume_total",                   precision: 8, scale: 2, default: 0.0
    t.decimal "mg",                           precision: 8, scale: 2, default: 0.0
    t.decimal "e_and_o",                      precision: 8, scale: 2, default: 0.0
    t.decimal "amount_paid",                  precision: 8, scale: 2, default: 0.0
    t.decimal "amount_due",                   precision: 8, scale: 2, default: 0.0
    t.integer "deal_id",                                                            null: false
    t.decimal "gr_percentage",                precision: 5, scale: 2, default: 0.0
    t.decimal "current_total_expenses",       precision: 8, scale: 2, default: 0.0
    t.decimal "cume_total_expenses",          precision: 8, scale: 2, default: 0.0
    t.decimal "current_total",                precision: 8, scale: 2, default: 0.0
    t.decimal "current_total_revenue",        precision: 8, scale: 2, default: 0.0
    t.decimal "cume_total_revenue",           precision: 8, scale: 2, default: 0.0
    t.decimal "joined_total_revenue",         precision: 8, scale: 2, default: 0.0
    t.decimal "joined_total_expenses",        precision: 8, scale: 2, default: 0.0
    t.decimal "joined_total",                 precision: 8, scale: 2, default: 0.0
    t.decimal "joined_amount_due",            precision: 8, scale: 2, default: 0.0
    t.decimal "current_share_minus_expenses", precision: 8, scale: 2, default: 0.0
    t.date    "date_sent"
    t.decimal "current_reserve",              precision: 8, scale: 2, default: 0.0
    t.decimal "cume_reserve",                 precision: 8, scale: 2, default: 0.0
    t.decimal "liquidated_reserve",           precision: 8, scale: 2, default: 0.0
    t.decimal "joined_reserve",               precision: 8, scale: 2, default: 0.0
  end

  create_table "royalty_revenue_streams", force: :cascade do |t|
    t.integer "royalty_report_id",                                            null: false
    t.integer "revenue_stream_id",                                            null: false
    t.decimal "current_revenue",        precision: 8, scale: 2, default: 0.0
    t.decimal "current_gr",             precision: 8, scale: 2, default: 0.0
    t.decimal "current_expense",        precision: 8, scale: 2, default: 0.0
    t.decimal "current_difference",     precision: 8, scale: 2, default: 0.0
    t.decimal "current_licensor_share", precision: 8, scale: 2, default: 0.0
    t.decimal "cume_revenue",           precision: 8, scale: 2, default: 0.0
    t.decimal "cume_gr",                precision: 8, scale: 2, default: 0.0
    t.decimal "cume_expense",           precision: 8, scale: 2, default: 0.0
    t.decimal "cume_difference",        precision: 8, scale: 2, default: 0.0
    t.decimal "cume_licensor_share",    precision: 8, scale: 2, default: 0.0
    t.decimal "licensor_percentage",    precision: 5, scale: 2, default: 0.0
    t.decimal "joined_revenue",         precision: 8, scale: 2, default: 0.0
    t.decimal "joined_gr",              precision: 8, scale: 2, default: 0.0
    t.decimal "joined_expense",         precision: 8, scale: 2, default: 0.0
    t.decimal "joined_difference",      precision: 8, scale: 2, default: 0.0
    t.decimal "joined_licensor_share",  precision: 8, scale: 2, default: 0.0
  end

  create_table "settings", force: :cascade do |t|
    t.string  "booking_confirmation_text"
    t.integer "next_booking_invoice_number"
    t.integer "next_dvd_invoice_number"
  end

  create_table "shipping_addresses", force: :cascade do |t|
    t.string  "label"
    t.string  "address1"
    t.string  "address2"
    t.string  "city"
    t.string  "state"
    t.string  "zip"
    t.string  "country"
    t.integer "customer_id", default: 0
    t.string  "name"
  end

  create_table "sub_rights", force: :cascade do |t|
    t.integer "right_id",                       null: false
    t.integer "sublicensor_id",                 null: false
    t.integer "territory_id",                   null: false
    t.date    "start_date",                     null: false
    t.date    "end_date",                       null: false
    t.boolean "exclusive",      default: false
    t.integer "film_id",                        null: false
  end

  add_index "sub_rights", ["right_id"], name: "index_sub_rights_on_right_id", using: :btree
  add_index "sub_rights", ["sublicensor_id"], name: "index_sub_rights_on_sublicensor_id", using: :btree
  add_index "sub_rights", ["territory_id"], name: "index_sub_rights_on_territory_id", using: :btree

  create_table "sublicensors", force: :cascade do |t|
    t.string  "name",                         null: false
    t.string  "email",        default: ""
    t.string  "phone",        default: ""
    t.string  "contact_name", default: ""
    t.boolean "w8",           default: false
  end

  create_table "territories", force: :cascade do |t|
    t.string  "name",                  null: false
    t.boolean "world", default: false
  end

  create_table "topics", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at",                                     null: false
    t.datetime "updated_at",                                     null: false
    t.string   "email",                                          null: false
    t.string   "encrypted_password", limit: 128,                 null: false
    t.string   "confirmation_token", limit: 128
    t.string   "remember_token",     limit: 128,                 null: false
    t.string   "name",                                           null: false
    t.string   "title"
    t.string   "email_signature"
    t.boolean  "admin",                          default: false
    t.boolean  "booker",                         default: false
  end

  add_index "users", ["email"], name: "index_users_on_email", using: :btree
  add_index "users", ["remember_token"], name: "index_users_on_remember_token", using: :btree

  create_table "venues", force: :cascade do |t|
    t.string "label",                          null: false
    t.string "billing_name",      default: ""
    t.string "billing_address1",  default: ""
    t.string "billing_address2",  default: ""
    t.string "billing_city",      default: ""
    t.string "billing_state",     default: ""
    t.string "billing_zip",       default: ""
    t.string "billing_country",   default: ""
    t.string "shipping_name",     default: ""
    t.string "shipping_address1", default: ""
    t.string "shipping_address2", default: ""
    t.string "shipping_city",     default: ""
    t.string "shipping_state",    default: ""
    t.string "shipping_zip",      default: ""
    t.string "shipping_country",  default: ""
    t.string "website",           default: ""
    t.string "sage_id"
    t.string "email",             default: ""
    t.string "phone",             default: ""
    t.string "notes",             default: ""
    t.string "venue_type",                     null: false
    t.string "contact_name",      default: ""
  end

  create_table "weekly_box_offices", force: :cascade do |t|
    t.integer "order",                                            null: false
    t.integer "booking_id",                                       null: false
    t.decimal "amount",     precision: 8, scale: 2, default: 0.0
  end

  add_index "weekly_box_offices", ["booking_id"], name: "index_weekly_box_offices_on_booking_id", using: :btree

  create_table "weekly_terms", force: :cascade do |t|
    t.integer "booking_id", null: false
    t.string  "terms",      null: false
    t.integer "order",      null: false
  end

  add_index "weekly_terms", ["booking_id"], name: "index_weekly_terms_on_booking_id", using: :btree

end
