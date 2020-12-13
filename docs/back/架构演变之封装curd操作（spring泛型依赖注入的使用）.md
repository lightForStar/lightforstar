# 开发使用的框架
- spring + springmvc + Mybatis
- 演示项目的两个实体类

```java
@Data
public abstract class BaseEntity implements Serializable {
    private Long id;
    private Date created;
    private Date updated;
}
```


```java
@Data
public class TbContent extends BaseEntity {
    @Length(min = 1,max = 20,message = "标题长度介于1-20个字符之间")
    private String title;
    @Length(min = 1,max = 20,message = "子标题长度介于1-20个字符之间")
    private String subTitle;
    @Length(min = 1,max = 20,message = "标题描述长度介于1-20个字符之间")
    private String titleDesc;

    private String url;
    private String pic;
    private String pic2;
    @Length(min = 1,message = "内容不能为空")
    private String content;
    @NotNull(message = "父级类目不能为空")
    private TbContentCategory tbContentCategory;
}
```

```java
@Data
public class TbUser extends BaseEntity implements Serializable {
    @Length(min = 1,max = 20,message = "姓名的长度必须在1-20个字符之间")
    private String username;
    @JsonIgnore
    private String password;
    @Pattern(regexp = RegexpUtils.PHONE,message = "手机号码格式不正确")
    private String phone;
    @Pattern(regexp = RegexpUtils.EMAIL,message = "邮箱格式不正确")
    private String email;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss",timezone = "GMT+8")
    private Date created;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss",timezone = "GMT+8")
    private Date updated;
}
```

# 原始开发形态

## dao层
每一张表都需要增删改查，所以每一个mapper都会有增删改查四个方法，这里我以两张表做为例子。


- 用户表
```java
/**
 * Created by Z先生 on 2020/1/13.
 */
@Repository
public interface TbUserDao {
    /**
     * 查询全部用户信息
     *
     * @return
     */
    List<TbUser> selectAll();

    void insert(TbUser tbUser);

    void update(TbUser tbUser);

    TbUser getUserById(Long id);

    void delete(Long id);

    TbUser getByEmail(String email);


    void deleteMulti(List<String> ids);

    /**
     * 分页查询返回的数据
     * @param start 从第几条开始   0表示第一条
     * @param length 查询的条数
     * @return
     */
    List<TbUser> page(@Param("start") Integer start,@Param("length") Integer length,@Param("tbUser")TbUser tbUser);

    /**
     * 分页查询的总条数
     * @return
     */
    Integer totalCount(@Param("tbUser")TbUser tbUser);
}
```

- 内容表
```java
@Repository
public interface TbContentDao {
    /**
     * 查询全部n内容信息
     *
     * @return
     */
    List<TbContent> selectAll();

    void insert(TbContent tbContent);

    void update(TbContent tbContent);

    TbContent getContentById(Long id);

    void delete(Long id);



    void deleteMulti(List<String> ids);

    /**
     * 分页查询返回的数据
     * @param start 从第几条开始   0表示第一条
     * @param length 查询的条数
     * @return
     */
    List<TbUser> page(@Param("start") Integer start, @Param("length") Integer length, @Param("tbContent") TbContent tbContent);

    /**
     * 分页查询的总条数
     * @return
     */
    Integer totalCount(@Param("tbContent") TbContent tbContent);
}
```

## service层
- TbUserService
- 接口
```java
public interface TbUserService {

    TbUser login(String email,String password);

    void deleteById(Long id);

    void update(TbUser tbUser);

    TbUser getUserById(Long id);


    BaseResult save(TbUser tbUser);


    void deleteMulti(List<String> ids);

    /**
     * 分页查询返回的数据
     * @param start 从第几条开始   0表示第一条
     * @param length 查询的条数
     * @param tbUser
     * @return
     */


    PageInfo<TbUser> page(Integer start, Integer length, Integer draw, TbUser tbUser);

    /**
     * 分页查询的总条数
     * @return
     * @param tbUser
     */
    Integer totalCount(TbUser tbUser);
}
```
- 实现类
```java
@Service
public class TbUserServiceImpl implements TbUserService {

    @Autowired
    private TbUserDao tbUserDao;


    @Override
    public TbUser login(String email, String password) {
        TbUser tbUser = tbUserDao.getByEmail(email);
        if (tbUser!=null)
            if (DigestUtils.md5DigestAsHex(password.getBytes()).equals(tbUser.getPassword()))
                return tbUser;
        return tbUser;
    }

    @Override
    public List<TbUser> selectAll() {
        return null;
    }

    @Override
    public void delete(Long id) {
        tbUserDao.delete(id);
    }

    @Override
    public void update(TbUser tbUser) {
        tbUserDao.update(tbUser);
    }

    @Override
    public TbUser getById(Long id) {
        return tbUserDao.getById(id);
    }

    @Override
    public BaseResult save(TbUser tbUser) {
        String message = BeanValidator.validator(tbUser);
        // 验证不通过
        if (message != null) {
            return BaseResult.fail(message);
        }

        // 通过验证
        else {
            tbUser.setUpdated(new Date());

            // 新增用户
            if (tbUser.getId() == null) {
                // 密码需要加密处理
                tbUser.setPassword(DigestUtils.md5DigestAsHex(tbUser.getPassword().getBytes()));
                tbUser.setCreated(new Date());
                tbUserDao.insert(tbUser);
            }

            // 编辑用户
            else {
                // 编辑用户时如果没有输入密码则沿用原来的密码
                if (StringUtils.isBlank(tbUser.getPassword())) {
                    TbUser oldTbUser = getById(tbUser.getId());
                    tbUser.setPassword(oldTbUser.getPassword());
                } else {
                    // 验证密码是否符合规范，密码长度介于 6 - 20 位之间
                    if (StringUtils.length(tbUser.getPassword()) < 6 || StringUtils.length(tbUser.getPassword()) > 20) {
                        return BaseResult.fail("密码长度必须介于 6 - 20 位之间");
                    }

                    // 设置密码加密
                    tbUser.setPassword(DigestUtils.md5DigestAsHex(tbUser.getPassword().getBytes()));
                }
                update(tbUser);
            }

            return BaseResult.success("保存用户信息成功");
        }
    }



    @Override
    public void deleteMulti(List<String> ids){
        tbUserDao.deleteMulti(ids);
    }

    @Override
    public PageInfo<TbUser> page(Integer start, Integer length, Integer draw, TbUser tbUser) {
        PageInfo pageInfo = new PageInfo();
        Integer totalCount = totalCount(tbUser);
        pageInfo.setData(tbUserDao.page(start, length,tbUser));
        pageInfo.setDraw(draw);
        pageInfo.setRecordsFiltered(totalCount);
        pageInfo.setRecordsTotal(totalCount);
        pageInfo.setError("");
        return pageInfo;
    }

    @Override
    public Integer totalCount(TbUser tbUser) {
        return tbUserDao.totalCount(tbUser);
    }
}
```
- TbContentService
- 接口
```java
public interface TbContentService {
    /**
     * 查询全部n内容信息
     *
     * @return
     */
    List<TbContent> selectAll();

    BaseResult save(TbContent tbContent);

    TbContent getById(Long id);

    void delete(Long id);

    void deleteMulti(List<String> ids);

    /**
     * 分页查询返回的数据
     * @param start 从第几条开始   0表示第一条
     * @param length 查询的条数
     * @return
     */
    PageInfo<TbContent> page(Integer start, Integer length, Integer draw, TbContent tbContent);

    /**
     * 分页查询的总条数
     * @return
     */
    Integer totalCount(@Param("tbContent") TbContent tbContent);
}
```
- 实现类
```java
@Service
public class TbContentServiceImpl implements TbContentService {
    @Autowired
    private TbContentDao tbContentDao;

    @Override
    public List<TbContent> selectAll() {
        return tbContentDao.selectAll();
    }

    @Override
    public BaseResult save(TbContent tbContent) {
        String message = BeanValidator.validator(tbContent);
        // 验证不通过
        if (message!=null) {
            return BaseResult.fail(message);
        }
        // 通过验证
        else {
            tbContent.setUpdated(new Date());

            // 新增内容
            if (tbContent.getId() == null) {
                tbContent.setCreated(new Date());
                tbContentDao.insert(tbContent);
            }
            // 编辑内容
            else {

                tbContentDao.update(tbContent);
                }

            }

            return BaseResult.success("保存内容成功");
        }




    @Override
    public TbContent getContentById(Long id) {
        return tbContentDao.getById(id);
    }

    @Override
    public void delete(Long id) {
        tbContentDao.delete(id);
    }

    @Override
    public void deleteMulti(List<String> ids) {
        tbContentDao.deleteMulti(ids);
    }

    @Override
    public PageInfo<TbContent> page(Integer start, Integer length, Integer draw, TbContent tbContent) {
        PageInfo<TbContent> pageInfo = new PageInfo();
        Integer totalCount = totalCount(tbContent);
        pageInfo.setData(tbContentDao.page(start, length,tbContent));
        pageInfo.setDraw(draw);
        pageInfo.setRecordsFiltered(totalCount);
        pageInfo.setRecordsTotal(totalCount);
        pageInfo.setError("");
        return pageInfo;
    }

    @Override
    public Integer totalCount(TbContent tbContent) {
        return tbContentDao.totalCount(tbContent);
    }
}
```
## dao、service层的一些冗余
- dao层有冗余
- service层在接口和实现类上都有冗余

# 简单封装阶段
## 抽取的dao层和service层
- dao层接口
```java
public interface BaseDao<T extends BaseEntity> {
    /**
     * 查询全部
     *
     * @return
     */
    List<T> selectAll();

    /**
     * 新增
     * @param entity
     */
    void insert(T entity);

    /**
     * 更新
     * @param entity
     */
    void update(T entity);

    /**
     * 根据id查询
     * @param id
     * @return
     */
    T getById(Long id);

    /**
     * 删除
     * @param id
     */
    void delete(Long id);

    /**
     * 批量删除
     * @param ids
     */
    void deleteMulti(List<String> ids);

    /**
     * 分页查询返回的数据
     * @param params      * @param start 从第几条开始   0表示第一条  length 查询的条数
     * @return
     */
    List<T> page(Map<String,Object> params);

    /**
     * 分页查询的总条数
     * @return
     */
    Integer totalCount(T entity);
}
```

- service层接口
```java
public interface BaseService<T extends BaseEntity> {

    /**
     * 查询全部n内容信息
     *
     * @return
     */
    List<T> selectAll();

    /**
     * 删除
     * @param id
     */
    void delete(Long id);

    /**
     * 更新
     * @param entity
     */
    void update(T entity);

    /**
     * 根据id查找
     * @param id
     * @return
     */
    T getById(Long id);

    /**
     * 新增或者更新
     * @param entity
     * @return
     */
    BaseResult save(T entity);

    /**
     * 批量删除
     * @param ids
     */
    void deleteMulti(List<String> ids);

    /**
     * 分页查询返回的数据
     * @param start 从第几条开始   0表示第一条
     * @param length 查询的条数
     * @param entity 筛选条件的实体类
     * @return
     */
    PageInfo<T> page(Integer start, Integer length, Integer draw, T entity);

    /**
     * 分页查询的总条数
     * @return
     * @param entity
     */
    Integer totalCount(T entity);
}
```

## dao层
- TbUser
```java
@Repository
public interface TbUserDao extends BaseDao<TbUser> {
    TbUser getByEmail(String email);
}
```
- TbContent
```java
@Repository
public interface TbContentDao extends BaseDao<TbContent> {

}

```

## service层
- TbUser
- 接口
```java
public interface TbUserService extends BaseService<TbUser> {
    TbUser login(String email,String password);
}
```
- 实现类
```txt
    和简单封装阶段一样
```
- TbContent
- 接口
```java
public interface TbContentService extends BaseService<TbContent> {

}
```
- 实现类
```txt
    和简单封装阶段一样
```

## 和原始阶段的对比
- 解决了接口层次的冗余，抽取了公共部分
- 仍然存在实现类的冗余

# 高度封装阶段
## 抽取共同的实现类
- 抽象类带上对公共方法的默认实现
```java
public abstract class AbstractBaseServiceImpl<T extends BaseEntity,D extends BaseDao<T>> implements BaseService<T> {
    @Autowired
    protected D dao;
    @Override
    public List<T> selectAll() {
        return dao.selectAll();
    }

    @Override
    public void delete(Long id) {
        dao.delete(id);
    }

    @Override
    public void update(T entity) {
        dao.update(entity);
    }

    @Override
    public T getById(Long id) {
        return dao.getById(id);
    }

    @Override
    public BaseResult save(T entity) {
        return null;
    }

    @Override
    public void deleteMulti(List<String> ids) {
        dao.deleteMulti(ids);
    }

    @Override
    public PageInfo<T> page(Integer start, Integer length, Integer draw, T entity) {
        PageInfo<T> pageInfo = new PageInfo();
        Integer totalCount = totalCount(entity);
        HashMap<String,Object> params = new HashMap<>();
        params.put("start",start);
        params.put("length",length);
        params.put("entity",entity);
        pageInfo.setData(dao.page(params));
        pageInfo.setDraw(draw);
        pageInfo.setRecordsFiltered(totalCount);
        pageInfo.setRecordsTotal(totalCount);
        pageInfo.setError("");
        return pageInfo;
    }

    @Override
    public Integer totalCount(T entity) {
        return dao.totalCount(entity);
    }
}

```

## dao层
- 和简单封装阶段一样

## service层
- 接口层次：和简答封装阶段一样
- 实现类层次

  **TbUser**
```java
@Service
public class TbUserServiceImpl extends AbstractBaseServiceImpl<TbUser,TbUserDao> implements TbUserService {

    @Override
    public TbUser login(String email, String password) {
        TbUser tbUser = dao.getByEmail(email);
        if (tbUser!=null)
            if (DigestUtils.md5DigestAsHex(password.getBytes()).equals(tbUser.getPassword()))
                return tbUser;
        return tbUser;
    }

    @Override
    public BaseResult save(TbUser tbUser) {
        String message = BeanValidator.validator(tbUser);
        // 验证不通过
        if (message != null) {
            return BaseResult.fail(message);
        }

        // 通过验证
        else {
            tbUser.setUpdated(new Date());

            // 新增用户
            if (tbUser.getId() == null) {
                // 密码需要加密处理
                tbUser.setPassword(DigestUtils.md5DigestAsHex(tbUser.getPassword().getBytes()));
                tbUser.setCreated(new Date());
                dao.insert(tbUser);
            }

            // 编辑用户
            else {
                // 编辑用户时如果没有输入密码则沿用原来的密码
                if (StringUtils.isBlank(tbUser.getPassword())) {
                    TbUser oldTbUser = getById(tbUser.getId());
                    tbUser.setPassword(oldTbUser.getPassword());
                } else {
                    // 验证密码是否符合规范，密码长度介于 6 - 20 位之间
                    if (StringUtils.length(tbUser.getPassword()) < 6 || StringUtils.length(tbUser.getPassword()) > 20) {
                        return BaseResult.fail("密码长度必须介于 6 - 20 位之间");
                    }

                    // 设置密码加密
                    tbUser.setPassword(DigestUtils.md5DigestAsHex(tbUser.getPassword().getBytes()));
                }
                update(tbUser);
            }

            return BaseResult.success("保存用户信息成功");
        }
    }
}
```

**TbContent**
```java
@Service
public class TbContentServiceImpl extends AbstractBaseServiceImpl<TbContent,TbContentDao> implements TbContentService {
    @Override
    public BaseResult save(TbContent tbContent) {
        String message = BeanValidator.validator(tbContent);
        // 验证不通过
        if (message!=null) {
            return BaseResult.fail(message);
        }
        // 通过验证
        else {
            tbContent.setUpdated(new Date());

            // 新增内容
            if (tbContent.getId() == null) {
                tbContent.setCreated(new Date());
                dao.insert(tbContent);
            }
            // 编辑内容
            else {
                update(tbContent);
            }

        }

        return BaseResult.success("保存内容成功");
    }

}
```

## 和简短封装阶段的对比
- 解决了接口层次和实现类层次的冗余，我们如果有需要可以根据实现类的不同重写对应的方法


# 总结
   我们从原始开发阶段到高度封装阶段都是制作了一件事，解决冗余，让我们的代码更加精简。简单封装阶段我们通过抽取公共接口，让对应业务的接口继承公共接口从而达到解决接口层次的冗余，我们解决了接口层次的冗余之后发现service层的实现类也有很多共有的方法，区别就在于每个实现类都使用不同的dao接口，因此我们必须能做到动态改变dao层接口；在高度封装阶段，我们利用了spring的泛型注入达到了动态改变dao层接口的目的，对于实现类我们可以采取这样一种措施，使用抽象类并且赋予默认实现，这样我们的service层实现都可以通过继承这个抽象类而获得默认实现，简化我们的代码，我们的业务功能可以放在业务接口上，这样我们就能做到只专注于业务功能的实现，而不需要管其他的公共功能。