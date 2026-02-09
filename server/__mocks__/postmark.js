module.exports = {
    ServerClient: jest.fn().mockImplementation(() => ({
        sendEmail: jest.fn().mockResolvedValue({})
    }))
}
