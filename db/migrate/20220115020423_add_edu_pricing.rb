class AddEduPricing < ActiveRecord::Migration[6.1]
  def change
    add_column :films, :msrp_pre_street, :decimal, precision: 5, scale: 2, default: "0.0"
    add_column :films, :msrp_post_street, :decimal, precision: 5, scale: 2, default: "0.0"
    add_column :films, :ppr_pre_street, :decimal, precision: 5, scale: 2, default: "0.0"
    add_column :films, :ppr_post_street, :decimal, precision: 5, scale: 2, default: "0.0"
    add_column :films, :drl_pre_street, :decimal, precision: 5, scale: 2, default: "0.0"
    add_column :films, :drl_post_street, :decimal, precision: 5, scale: 2, default: "0.0"
    add_column :films, :ppr_drl_pre_street, :decimal, precision: 5, scale: 2, default: "0.0"
    add_column :films, :ppr_drl_post_street, :decimal, precision: 5, scale: 2, default: "0.0"
  end
end
