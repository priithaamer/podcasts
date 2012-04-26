class Podcast < ActiveRecord::Base

  has_many :podcast_items

end