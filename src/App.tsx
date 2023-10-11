import { faker } from "@faker-js/faker";
import { Error, Refresh } from "@mui/icons-material";
import { Backdrop, Button, CircularProgress, Container, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { User, addUser, delay, getUsers } from "./mockApi";

const USERS_QUERY_KEY = 'users'

export function App() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: getUsers,
  })

  const mutation = useMutation({
    mutationFn: async (newUser: User) => await addUser(newUser),
    onMutate: async (newUser) => {
      await queryClient.cancelQueries([USERS_QUERY_KEY])

      const previousUsers = queryClient.getQueryData<User[]>([USERS_QUERY_KEY])

      queryClient.setQueryData([USERS_QUERY_KEY], [newUser, ...(previousUsers || [])])

      return { previousUsers }
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData([USERS_QUERY_KEY], () => context?.previousUsers)
      toast.error(`There was an error adding the user: ${variables.firstName} ${variables.lastName}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries([USERS_QUERY_KEY])
    },
    onSuccess: (data) => {
      toast.success(`User ${data.firstName} ${data.lastName} added successfully`)
    }
  })

  function createRandomUser() {
    return {
      age: faker.number.int({ min: 18, max: 60 }),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      gender: faker.person.sex(),
      id: faker.string.uuid(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number()
    }
  }

  useEffect(() => {
    (async () => {
      if (mutation.isSuccess || mutation.isError) {
        await delay()
        mutation.reset()
      }
    })()
  }, [mutation.isSuccess, mutation.isError])

  if (query.isLoading) {
    return (
      <Backdrop open>
        <Paper sx={{ p: 4 }}>
          <Stack spacing={2} alignItems={'center'}>
            <CircularProgress />

            <Typography variant='h6'>Searching users</Typography>
          </Stack>
        </Paper>
      </Backdrop>
    )
  }

  if (query.isError) {
    return (
      <Backdrop open>
        <Paper sx={{ p: 4 }}>
          <Stack spacing={2} alignItems={'center'}>
            <Error color='error' fontSize="large" />

            <Typography>There was an error when searching for users</Typography>

            <Button
              variant='contained'
              onClick={() => queryClient.invalidateQueries([USERS_QUERY_KEY])}
              startIcon={<Refresh />}
            >
              Retry
            </Button>
          </Stack>
        </Paper>
      </Backdrop>
    )
  }

  return (
    <Container>
      <Stack py={4} alignItems={'center'}>
        <Typography variant='h4'>User Management</Typography>
      </Stack>

      <Stack py={2} spacing={2} alignItems={'flex-end'}>
        <Button
          variant='contained'
          onClick={() => {
            const newUser = createRandomUser()
            mutation.mutate(newUser)
          }}
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? 'Adding...' : 'Add'}
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {query.data?.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.age}</TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  )
}
