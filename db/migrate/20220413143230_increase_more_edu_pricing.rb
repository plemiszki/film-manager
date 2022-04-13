class IncreaseMoreEduPricing < ActiveRecord::Migration[6.1]
  def change
    change_column :films, :drl_pre_street, :decimal, precision: 7, scale: 2, default: "0.0"
    change_column :films, :drl_post_street, :decimal, precision: 7, scale: 2, default: "0.0"
    change_column :films, :drl_pre_street_member, :decimal, precision: 7, scale: 2, default: "0.0"
    change_column :films, :drl_post_street_member, :decimal, precision: 7, scale: 2, default: "0.0"
    change_column :films, :ppr_pre_street, :decimal, precision: 7, scale: 2, default: "0.0"
    change_column :films, :ppr_post_street, :decimal, precision: 7, scale: 2, default: "0.0"
    change_column :films, :ppr_pre_street_member, :decimal, precision: 7, scale: 2, default: "0.0"
    change_column :films, :ppr_post_street_member, :decimal, precision: 7, scale: 2, default: "0.0"
  end
end
