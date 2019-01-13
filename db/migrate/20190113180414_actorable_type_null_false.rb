class ActorableTypeNullFalse < ActiveRecord::Migration
  def change
    change_column_null :actors, :actorable_type, false
  end
end
