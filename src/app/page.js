'use client'
import React, { useState } from "react"
import Image from "next/image"
import { useEffect } from "react"
import { firestore } from "../../firebase"
import { Box, Stack, Typography, Button, Modal, TextField, AppBar, Toolbar, List, ListItem, ListItemText, Divider, InputAdornment } from "@mui/material"
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

// Modal Style
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const Header = ({ onHomeClick, onRegisterClick }) => (
  <AppBar position="static" sx={{ bgcolor:"pink" }}>
    <Toolbar>
      <Typography variant="h6" color="black"component="div" sx={{ flexGrow: 1 }}>
        Pantry Tracker
      </Typography>
      <Button color="inherit" onClick={onHomeClick}
      sx={{ color: 'black', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
      >Home</Button>
    </Toolbar>
  </AppBar>
)

const HomePage = ({ onOpenInventory, onUpdateInventory }) => (
  <Box
    width="100vw"
    height="calc(100vh - 64px)"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    sx={{
      backgroundImage: 'url("https://img.freepik.com/free-vector/hand-drawn-cute-food-frame-background_23-2149602177.jpg")', // Placeholder for background image
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <Typography variant="h3" color="black" fontWeight="bold" mb={4}>
      Welcome to Pantry Tracker
    </Typography>
    <Typography variant="h5" color="black" fontWeight="bold" mb={4}>
      What would you like to do today?
    </Typography>
    <Box display="flex" gap={2}>
      <Button variant="contained" color="secondary" size="large" onClick={onOpenInventory}>
        Open Inventory
      </Button>
      <Button variant="contained" color="secondary" size="large" onClick={onUpdateInventory}>
        Update Inventory
      </Button>
    </Box>
  </Box>
)

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
)

const InventoryListPage = ({ inventory, onUpdateInventory }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (a.name.toLowerCase().startsWith(searchTerm.toLowerCase())) return -1;
    if (b.name.toLowerCase().startsWith(searchTerm.toLowerCase())) return 1;
    return 0;
  });

  return (
    <Box
      width="100vw"
      height="calc(100vh - 64px)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding={4}
      sx={{ bgcolor:"pink" }}
    >
      <Typography variant="h2" gutterBottom>
        Inventory List
      </Typography>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={onUpdateInventory} 
        sx={{ mb: 2 }}
      >
        Update Inventory
      </Button>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search inventory..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2, maxWidth: 360 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        {sortedInventory.map(({ id, name, quantity }) => (
          <React.Fragment key={id}>
            <ListItem>
              <ListItemText 
                primary={typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : 'Unnamed Item'} 
                secondary={`Quantity: ${quantity}`} 
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  )
}

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const [showInventoryList, setShowInventoryList] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleUpdateInventory = () => {
    updateInventory();
    setShowInventory(true);
    setShowInventoryList(false);
  };

  // Update Inventory from Firestore
  const updateInventory = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'inventory'));
      const inventoryList = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Document Data:', data); // Debugging line
        return {
          id: doc.id, // Using Firestore document ID as a unique key
          name: data.name || 'Unnamed Item', // Default name if missing
          quantity: data.quantity || 0,      // Default quantity if missing
        };
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // Add Item to Inventory
 const addItem = async (item) => {
  try {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, name: item });
    } else {
      await setDoc(docRef, { quantity: 1, name: item });
    }
    await updateInventory();
  } catch (error) {
    console.error('Error adding item:', error);
  }
};

  // Remove Item from Inventory
  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1, name: item });
        }
      }
      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleHomeClick = () => {
    setShowInventory(false);
    setShowInventoryList(false);
    setShowRegister(false);
  };

  const handleRegisterClick = () => {
    setShowRegister(true);
    setShowInventory(false);
    setShowInventoryList(false);
  };

  const handleOpenInventory = () => {
    setShowInventoryList(true);
    setShowInventory(false);
  };

  return (
    <Box>
      <Header onHomeClick={handleHomeClick} onRegisterClick={handleRegisterClick} />
      {!showInventory && !showInventoryList && !showRegister ? (
        <HomePage onOpenInventory={handleOpenInventory} onUpdateInventory={handleUpdateInventory} />
      ) : showRegister ? (
        <Box
          width="100vw"
          height="calc(100vh - 64px)"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h2">Register Page (To be implemented)</Typography>
        </Box>
      ) : showInventoryList ? (
        <InventoryListPage inventory={inventory} onUpdateInventory={handleUpdateInventory} />
      ) : (
        <Box
          width="100vw"
          height="calc(100vh - 64px)"
          display={'flex'}
          justifyContent={'center'}
          flexDirection={'column'}
          alignItems={'center'}
          gap={2}
          sx={{ bgcolor:"pink" }}
        >
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style} >
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add Item
              </Typography>
              <Stack width="100%" direction={'row'} spacing={2}>
                <TextField
                  id="outlined-basic"
                  label="Item"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (itemName) { // Check if itemName is not empty
                      addItem(itemName);
                      setItemName('');
                    }
                    handleClose();
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Button variant="contained" color="secondary" onClick={handleOpen}>
            Add New Item
          </Button>
          <Box border={'1px solid #333'}>
            <Box
              width="800px"
              height="100px"
              bgcolor={'#ADD8E6'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
                Inventory Items
              </Typography>
            </Box>
            <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
            {inventory.map(({ id, name, quantity }) => (
            <Box
            key={id || `${name}-${Math.random()}`}
           width="100%"
            minHeight="70px"
            display={'flex'}
           justifyContent={'space-between'}
           alignItems={'center'}
           bgcolor={'#f0f0f0'}
           paddingX={5}
           >
          <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
           {typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : 'Unnamed Item'}
          </Typography>
          <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
          Quantity: {quantity}
          </Typography>
          <Box>
          <Button variant="contained" color="secondary" onClick={() => addItem(name)} sx={{ mr: 1 }}>
          Add
         </Button>
          <Button variant="contained" color="secondary"onClick={() => removeItem(name)}>
          Remove
          </Button>
      </Box>
    </Box>
  ))}
</Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}