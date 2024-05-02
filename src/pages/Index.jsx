import React, { useState, useEffect } from "react";
import { Box, Button, Container, Heading, Text, VStack, Input, useToast, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { client } from "lib/crud";

const colors = ["red", "blue", "green", "yellow"];
const words = ["RED", "BLUE", "GREEN", "YELLOW"];
const getRandomIndex = () => Math.floor(Math.random() * colors.length);

const Index = () => {
  const [currentColor, setCurrentColor] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [name, setName] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const startTest = () => {
    const colorIndex = getRandomIndex();
    const wordIndex = getRandomIndex();
    setCurrentColor(colors[colorIndex]);
    setCurrentWord(words[wordIndex]);
    setStartTime(new Date().getTime());
    setEndTime(0);
    setReactionTime(null);
  };

  const stopTest = () => {
    const endTime = new Date().getTime();
    setEndTime(endTime);
    const reactionTime = endTime - startTime;
    setReactionTime(reactionTime);
    if (name) {
      saveResult(reactionTime);
    }
  };

  const saveResult = async (reactionTime) => {
    await client.set(`leaderboard:${new Date().toISOString()}`, { name, reactionTime });
    fetchLeaderboard();
    toast({
      title: "Result saved",
      description: "Your result has been saved to the leaderboard.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const fetchLeaderboard = async () => {
    const results = await client.getWithPrefix("leaderboard:");
    if (results) {
      const sortedResults = results.map((r) => r.value).sort((a, b) => a.reactionTime - b.reactionTime);
      setLeaderboard(sortedResults);
    }
  };

  return (
    <Container maxW="container.md" p={4}>
      <VStack spacing={6}>
        <Heading>Reaction Speed Test</Heading>
        <Text>Test your reaction speed! Click "Start" and then "Stop" when the color and word match.</Text>
        <Box p={4} border="1px" borderColor="gray.200">
          <Text fontSize="2xl" color={currentColor}>
            {currentWord}
          </Text>
          <Button colorScheme="blue" onClick={startTest} m={2}>
            Start
          </Button>
          <Button colorScheme="green" onClick={stopTest} m={2}>
            Stop
          </Button>
          {reactionTime && <Text>Reaction Time: {reactionTime} ms</Text>}
        </Box>
        <Input placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => name && startTest()} colorScheme="teal">
          Save Result
        </Button>
        <Heading size="md">Leaderboard</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th isNumeric>Reaction Time (ms)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {leaderboard.map((entry, index) => (
              <Tr key={index}>
                <Td>{entry.name}</Td>
                <Td isNumeric>{entry.reactionTime}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Container>
  );
};

export default Index;
