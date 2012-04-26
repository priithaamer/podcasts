class PodcastItem < ActiveRecord::Base
  
  belongs_to :podcast
  
  attr_accessible :remote_id, :location, :content_type, :title, :guid, :published_at, :description
end