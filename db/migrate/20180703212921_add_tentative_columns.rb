class AddTentativeColumns < ActiveRecord::Migration
  def change
    add_column :films, :svod_tentative, :boolean, default: false
    add_column :films, :avod_tentative, :boolean, default: false
    add_column :films, :tvod_tentative, :boolean, default: false
  end
end
