package com.eformation.api.repository;

import com.eformation.api.model.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LevelRepository extends JpaRepository<Level, Long> {
    List<Level> findAllByOrderByOrderIndexAsc();

    @Query("select distinct l from Level l left join fetch l.domains d left join fetch d.phrases order by l.orderIndex asc ")
        List<Level> findAllWithDomains();

}

