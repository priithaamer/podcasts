class PodcastItem < ActiveRecord::Base
  
  belongs_to :podcast
  
  attr_accessible :remote_id, :location, :content_type, :title, :guid, :published_at, :description
  
  validates_uniqueness_of :remote_id, :scope => :podcast_id
end