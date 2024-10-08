﻿// UserService.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HackerNews.DataAccess.Entities;
using HackerNews.DataAccess.Repository.RepositoryInterfaces;
using HackerNewsApi.Services.ServicesInterfaces;

namespace HackerNewsApi.Service
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User> GetUserByIdAsync(Guid id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task RegisterUserAsync(User user)
        {
            user.Id = Guid.NewGuid();
            user.IsAdmin = false;
            await _userRepository.AddAsync(user);
        }

        public async Task<User> LoginAsync(string username, string password)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user != null && user.Password == password)
            {
                return user;
            }
            return null;
        }

        public async Task<bool> CheckUsernameAvailabilityAsync(string username)
        {
            return !await _userRepository.UsernameExistsAsync(username);
        }

        public async Task<List<long>> GetVotedPollsAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }
            return user.PollOptionsVotedIds;
        }

        public async Task UpdateUserAsync(User user)
        {
            await _userRepository.UpdateUserAsync(user);
        }
    }

}