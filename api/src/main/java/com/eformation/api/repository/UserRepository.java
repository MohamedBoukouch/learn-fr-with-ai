package com.eformation.api.repository;

import com.eformation.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT DISTINCT u.groupName FROM User u WHERE u.groupName IS NOT NULL AND u.groupName != ''")
    List<String> findDistinctGroupNames();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isApproved = :approved")
    Long countByApproved(@Param("approved") boolean approved);

    @Query("SELECT COUNT(u) FROM User u WHERE u.emmaAccess = :emmaAccess")
    Long countByEmmaAccess(@Param("emmaAccess") boolean emmaAccess);
}
