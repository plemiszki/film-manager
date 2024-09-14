class InstStripe < ActiveRecord::Migration[7.0]
  def change
    add_column :institutions, :stripe_id, :string, default: ""
    add_index :institutions, :stripe_id, unique: true, where: "stripe_id != ''"
    add_column :institutions, :use_stripe, :boolean, default: false
  end
end
