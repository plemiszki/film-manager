class ActorableTypeNullFalse < ActiveRecord::Migration[5.2]
  def change
    change_column_null :actors, :actorable_type, false
  end
end
