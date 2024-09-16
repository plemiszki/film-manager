class VenueStripeColumns < ActiveRecord::Migration[7.0]
  def change
    add_column :venues, :stripe_id, :string, default: ""
    add_index :venues, :stripe_id, unique: true, where: "stripe_id != ''"
    add_column :venues, :use_stripe, :boolean, default: false
  end
end
