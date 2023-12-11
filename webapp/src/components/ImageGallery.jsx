import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import './Gallery.css';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

function Gallery({ uuid }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [visibleImages, setVisibleImages] = useState([]);
  const [offset, setOffset] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [perPage, setPerPage] = useState(25);
  const [labeledStatus, setLabeledStatus] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showLabels, setShowLabels] = useState(false);
  const [imageLabels, setImageLabels] = useState([]);



  const fetchData = async (offset, perPage, labeledStatus) => {
    const response = await fetch(`${BASE_API_URL}/images?offset=${offset}&per_page=${perPage}&uuid=${uuid}&labeled=${labeledStatus}`);
    const data = await response.json();
    setVisibleImages([]);
    setSelectedItems([]);
    setVisibleImages(data.images);
    setHasMore(data.hasmore);
  };

  const fetchLabels = async (imageSrc) => {
    const response = await fetch(`${BASE_API_URL}/labels?type=imlabels&id=${imageSrc}`);
    const data = await response.json();
    setImageLabels(data.results);
  };

  useEffect(() => {
    fetchData(offset, perPage, labeledStatus);
  }, [offset, perPage, labeledStatus]);

  const handleItemClick = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter((item) => item !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const imagesToDelete = selectedItems.map((index) => visibleImages[index].src);
      const tablename = 'images';
      const response = await fetch(`${BASE_API_URL}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagesToDelete, tablename }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const remainingItems = visibleImages.filter((_, index) => !selectedItems.includes(index));
      setVisibleImages(remainingItems);
      setSelectedItems([]);
      fetchData(offset, perPage, labeledStatus);
    } catch (error) {
      console.error('A problem occurred when trying to delete images:', error);
    }
  };

  const handleSelectAll = () => {
    setSelectedItems([...Array(visibleImages.length).keys()]);
  };

  const handleImageDoubleClick = (index) => {
    setSelectedImage(visibleImages[index].src);
    setSelectedImageIndex(index);
    setIsModalVisible(true);
    fetchLabels(visibleImages[index].src);
  };

useEffect(() => {
  const handleKeyDown = (event) => {
    if (!isModalVisible) return;
    
    switch (event.key) {
      case 'ArrowRight':
        const nextIndex = Math.min(selectedImageIndex + 1, visibleImages.length - 1);
        setSelectedImage(visibleImages[nextIndex].src);
        setSelectedImageIndex(nextIndex);
        fetchLabels(visibleImages[nextIndex].src);
        break;
      case 'ArrowLeft':
        const prevIndex = Math.max(selectedImageIndex - 1, 0);
        setSelectedImage(visibleImages[prevIndex].src);
        setSelectedImageIndex(prevIndex);
        fetchLabels(visibleImages[prevIndex].src);
        break;
      default:
        break;
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedImageIndex, isModalVisible, visibleImages]);


  const isDeleteSelectedDisabled = selectedItems.length === 0;

  return (
    <div className="gallery-container">
      <div className="action-buttons">
        <div>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSelected}
            disabled={isDeleteSelectedDisabled}
            style={{ height: '48px', width: 'auto', marginRight: '16px' }}
          >
            Delete Selected
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSelectAll}
            disabled={visibleImages.length === 0}
            style={{ height: '48px', width: 'auto' }}
          >
            Select All
          </Button>
        </div>
        <div>
          <Select
            value={labeledStatus}
            onChange={(event) => setLabeledStatus(event.target.value)}
            style={{ height: '48px', width: 'auto', marginRight: '16px' }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Labeled">Labeled</MenuItem>
            <MenuItem value="Unlabeled">Unlabeled</MenuItem>
          </Select>
          <Select
            value={perPage}
            onChange={(event) => setPerPage(event.target.value)}
            style={{ height: '48px', width: 'auto', marginRight: '16px' }}
          >
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOffset(offset > 1 ? offset - 1 : 1)}
            disabled={offset <= 1}
            style={{ height: '48px', width: 'auto', marginRight: '16px' }}
          >
            Previous Page
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOffset(hasMore ? offset + 1 : offset)}
            disabled={!hasMore}
            style={{ height: '48px', width: 'auto' }}
          >
            Next Page
          </Button>
        </div>
      </div>
      <div className="gallery">
        {visibleImages.map((image, index) => (
          <div
            key={image.src}
            className={`gallery-item ${selectedItems.includes(index) ? 'selected' : ''}`}
            onClick={() => handleItemClick(index)}
            onDoubleClick={() => handleImageDoubleClick(index)}
          >
            {selectedItems.includes(index) && (
              <div className="selected-indicator">
                <CheckIcon />
              </div>
            )}
            <img src={BASE_API_URL + image.src} alt={`Image ${index + 1}`} />
          </div>
        ))}
      </div>
      <Dialog open={isModalVisible} onClose={() => {setIsModalVisible(false); setImageLabels([]);}} fullWidth maxWidth="md">
        <DialogContent>
          <div style={{ position: 'relative' }}>
            <img src={BASE_API_URL + selectedImage} alt="Selected" style={{ width: '100%', height: 'auto' }} />
            {showLabels && imageLabels.map((label, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: `calc(${label.y_center * 100}% - ${label.height * 50}%)`,
                    left: `calc(${label.x_center * 100}% - ${label.width * 50}%)`,
                    width: `${label.width * 100}%`,
                    height: `${label.height * 100}%`,
                    border: '2px solid red',
                    boxSizing: 'border-box',
                  }}
                >
                  {label.label}
                </div>
              ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalVisible(false)} color="secondary">
            Close
          </Button>
          <div>
          <label>
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(event) => setShowLabels(event.target.checked)}
            />
            Show Labels
          </label>
        </div>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default Gallery;
