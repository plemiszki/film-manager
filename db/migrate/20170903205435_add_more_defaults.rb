class AddMoreDefaults < ActiveRecord::Migration
  def change
    change_column_default :dvds, :upc, ""
    change_column_default :dvds, :stock, 0
    change_column_default :dvds, :repressing, false
    change_column_default :dvds, :sound_config, ""
    change_column_default :dvds, :special_features, ""
    change_column_default :dvds, :discs, 1
    change_column_default :dvds, :units_shipped, 0
  end
end
