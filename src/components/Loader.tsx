import { Box, CircularProgress, Stack } from '@mui/material';
import React from 'react';
import { useLoading } from '../redux-support';

export default function Loader() {
  const message = useLoading();

  if (message) {
    return (
      <>
        <Box
          sx={{
            position: 'fixed',
            opacity: '0.5',
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
            background: 'gray',
            zIndex: '10000'
          }}
        />
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            right: '50%',
            bottom: '50%',
            left: '50%',
            zIndex: '10001'
          }}
        >
          <Stack
            direction={'row'}
            spacing={2}
            justifyContent={'center'}
            alignItems={'center'}
            sx={{ border: 'res solid 1px' }}
          >
            <div>
              <CircularProgress color={'primary'} />
            </div>
            <div style={{ whiteSpace: 'nowrap', fontSize: '120%' }}>{message}</div>
          </Stack>
        </Box>
      </>
    );
  }
  return <></>;
}
