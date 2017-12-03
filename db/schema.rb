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

ActiveRecord::Schema.define(version: 20171203222357) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "deal_templates", force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "dvd_customers", force: :cascade do |t|
    t.string  "name",                                                null: false
    t.decimal "discount",       precision: 5, scale: 2
    t.boolean "consignment",                                         null: false
    t.string  "notes",                                  default: ""
    t.string  "sage_id",                                             null: false
    t.string  "invoices_email",                                      null: false
    t.string  "payment_terms",                                       null: false
    t.decimal "per_unit",       precision: 5, scale: 2
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

  create_table "film_revenue_percentages", force: :cascade do |t|
    t.integer "film_id",                                                 null: false
    t.integer "revenue_stream_id",                                       null: false
    t.decimal "value",             precision: 5, scale: 2, default: 0.0
  end

  add_index "film_revenue_percentages", ["film_id"], name: "index_film_revenue_percentages_on_film_id", using: :btree
  add_index "film_revenue_percentages", ["revenue_stream_id"], name: "index_film_revenue_percentages_on_revenue_stream_id", using: :btree

  create_table "film_rights", force: :cascade do |t|
    t.integer "film_id",                  null: false
    t.integer "right_id",                 null: false
    t.boolean "value",    default: false
  end

  add_index "film_rights", ["film_id", "right_id"], name: "index_film_rights_on_film_id_and_right_id", unique: true, using: :btree

  create_table "films", force: :cascade do |t|
    t.string  "title",                                                      null: false
    t.boolean "short_film",                                 default: false
    t.integer "feature_id"
    t.integer "label_id",                                                   null: false
    t.integer "licensor_id"
    t.integer "deal_type_id",                               default: 1
    t.integer "days_statement_due"
    t.decimal "gr_percentage",      precision: 5, scale: 2
    t.decimal "mg",                 precision: 8, scale: 2, default: 0.0
    t.decimal "e_and_o",            precision: 8, scale: 2, default: 0.0
    t.decimal "expense_cap",        precision: 8, scale: 2, default: 0.0
    t.string  "sage_id",                                    default: ""
    t.string  "royalty_notes",                              default: ""
    t.boolean "export_reports",                             default: true
    t.boolean "send_reports",                               default: true
    t.boolean "reserve",                                    default: false
    t.decimal "reserve_percentage", precision: 5, scale: 2, default: 0.0
    t.integer "reserve_quarters",                           default: 0
    t.integer "sell_off_period",                            default: 0
    t.boolean "auto_renew",                                 default: false
    t.integer "auto_renew_term",                            default: 0
  end

  add_index "films", ["deal_type_id"], name: "index_films_on_deal_type_id", using: :btree
  add_index "films", ["feature_id"], name: "index_films_on_feature_id", using: :btree
  add_index "films", ["label_id"], name: "index_films_on_label_id", using: :btree
  add_index "films", ["licensor_id"], name: "index_films_on_licensor_id", using: :btree
  add_index "films", ["title", "short_film"], name: "index_films_on_title_and_short_film", unique: true, using: :btree

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

  create_table "invoice_rows", force: :cascade do |t|
    t.integer "invoice_id",                                        null: false
    t.string  "item_label",                                        null: false
    t.decimal "unit_price",  precision: 8, scale: 2, default: 0.0
    t.integer "item_qty",                                          null: false
    t.decimal "total_price", precision: 8, scale: 2, default: 0.0
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
    t.decimal "ship_fee",          precision: 8, scale: 2, default: 0.0
    t.decimal "total",             precision: 8, scale: 2, default: 0.0
    t.string  "po_number"
  end

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

  create_table "licensors", force: :cascade do |t|
    t.string "name",    null: false
    t.string "email"
    t.string "address"
  end

  add_index "licensors", ["name"], name: "index_licensors_on_name", unique: true, using: :btree

  create_table "purchase_order_items", force: :cascade do |t|
    t.integer "purchase_order_id",             null: false
    t.string  "item_type",                     null: false
    t.integer "item_id",                       null: false
    t.integer "order",                         null: false
    t.integer "qty",               default: 0
  end

  create_table "purchase_orders", force: :cascade do |t|
    t.string  "number",                      null: false
    t.integer "customer_id",  default: 0
    t.string  "address1",     default: ""
    t.string  "address2",     default: ""
    t.string  "city",         default: ""
    t.string  "state",        default: ""
    t.string  "zip",          default: ""
    t.date    "order_date"
    t.date    "ship_date"
    t.string  "name",         default: ""
    t.string  "country",      default: ""
    t.boolean "send_invoice", default: true
    t.string  "source_doc"
  end

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
  end

  add_index "users", ["email"], name: "index_users_on_email", using: :btree
  add_index "users", ["remember_token"], name: "index_users_on_remember_token", using: :btree

end
