class CreatePodcasts < ActiveRecord::Migration
  def change
    create_table :podcasts do |t|
      t.string :code, :title, :link, :docs, :null => false
      t.string :image
      t.timestamps
    end
    
    create_table :podcast_items do |t|
      t.integer :podcast_id, :null => false
      t.integer :remote_id
      t.string :title, :guid, :location, :content_type, :null => false
      t.datetime :published_at, :null => false
      t.text :description
      t.timestamps
    end
    
    add_index :podcast_items, :podcast_id
    add_index :podcast_items, :remote_id
    add_index :podcast_items, :published_at
  end
end