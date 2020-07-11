class ChangeNumberFieldsToDecimals < ActiveRecord::Migration[5.2]
  def change
    change_column :films, :gr_percentage, :decimal, :precision => 5, :scale => 2
    change_column :films, :mg, :decimal, :precision => 5, :scale => 2
    change_column :films, :e_and_o, :decimal, :precision => 5, :scale => 2
    change_column :films, :expense_cap, :decimal, :precision => 5, :scale => 2
  end
end
