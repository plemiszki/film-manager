class ChangePrecision < ActiveRecord::Migration[5.2]
  def change
    change_column :films, :mg, :decimal, :precision => 8, :scale => 2
    change_column :films, :e_and_o, :decimal, :precision => 8, :scale => 2
    change_column :films, :expense_cap, :decimal, :precision => 8, :scale => 2
  end
end
