# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120426062803) do

  create_table "podcast_items", :force => true do |t|
    t.integer  "podcast_id",   :null => false
    t.integer  "remote_id"
    t.string   "title",        :null => false
    t.string   "guid",         :null => false
    t.string   "location",     :null => false
    t.string   "content_type", :null => false
    t.datetime "published_at", :null => false
    t.text     "description"
    t.datetime "created_at",   :null => false
    t.datetime "updated_at",   :null => false
  end

  add_index "podcast_items", ["podcast_id"], :name => "index_podcast_items_on_podcast_id"
  add_index "podcast_items", ["published_at"], :name => "index_podcast_items_on_published_at"
  add_index "podcast_items", ["remote_id"], :name => "index_podcast_items_on_remote_id"

  create_table "podcasts", :force => true do |t|
    t.string   "code",       :null => false
    t.string   "title",      :null => false
    t.string   "link",       :null => false
    t.string   "docs",       :null => false
    t.string   "image"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

end
